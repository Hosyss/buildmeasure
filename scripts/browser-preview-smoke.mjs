import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const token = process.env.GITHUB_TOKEN?.trim();
const repository = process.env.GITHUB_REPOSITORY?.trim();
const previewSha = process.env.PREVIEW_SHA?.trim();
const waitMs = Number.parseInt(process.env.PREVIEW_WAIT_MS ?? "480000", 10);

if (!token || !repository || !previewSha) {
  throw new Error("GITHUB_TOKEN, GITHUB_REPOSITORY, and PREVIEW_SHA are required.");
}

if (typeof WebSocket !== "function") {
  throw new Error("This smoke test requires the Node.js WebSocket implementation.");
}

const routes = [
  "/",
  "/calculators",
  "/concrete-project-calculator",
  "/concrete-calculator",
  "/circular-slab-calculator",
  "/footing-calculator",
  "/column-calculator",
  "/wall-calculator",
  "/post-hole-concrete-calculator",
  "/paint-calculator",
  "/tile-calculator",
  "/drywall-calculator",
  "/brick-calculator",
  "/gravel-calculator",
  "/mulch-calculator",
  "/guides",
  "/projects",
];

const viewports = [
  { width: 360, height: 800, name: "phone" },
  { width: 768, height: 900, name: "tablet" },
  { width: 1280, height: 900, name: "desktop" },
];

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithTimeout(url, init = {}, timeoutMs = 20_000) {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "user-agent": "BuildNumbers-browser-preview-smoke/1.0",
      ...init.headers,
    },
  });
}

async function findExactPreviewUrl() {
  const deadline = Date.now() + waitMs;
  const checksUrl = `https://api.github.com/repos/${repository}/commits/${previewSha}/check-runs?per_page=100`;

  while (Date.now() < deadline) {
    const response = await fetchWithTimeout(checksUrl, {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub check-runs lookup failed with HTTP ${response.status}.`);
    }

    const payload = await response.json();
    const checks = Array.isArray(payload.check_runs) ? payload.check_runs : [];
    const cloudflareCheck = checks
      .filter((check) => check?.name === "Cloudflare Pages: buildnumbers")
      .sort((left, right) => new Date(right.started_at ?? 0) - new Date(left.started_at ?? 0))[0];

    if (!cloudflareCheck || cloudflareCheck.status !== "completed") {
      await sleep(5_000);
      continue;
    }

    if (cloudflareCheck.conclusion !== "success") {
      throw new Error(`Cloudflare Pages check completed with ${cloudflareCheck.conclusion ?? "no conclusion"}.`);
    }

    const summary = cloudflareCheck.output?.summary ?? "";
    const previewMatch = summary.match(/https:\/\/[a-f0-9]{8}\.buildnumbers\.pages\.dev\b/i);
    if (!previewMatch) {
      throw new Error("Cloudflare Pages succeeded but its immutable BuildNumbers Preview URL was not present in the check output.");
    }

    return previewMatch[0];
  }

  throw new Error(`Timed out after ${waitMs}ms waiting for the exact-head Cloudflare Pages Preview.`);
}

function findBrowserCommand() {
  for (const command of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    const probe = spawnSync("which", [command], { encoding: "utf8" });
    if (probe.status === 0 && probe.stdout.trim()) return probe.stdout.trim();
  }
  throw new Error("No Chrome/Chromium executable was found on the GitHub runner.");
}

async function waitForDebugPort(browser) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let stderr = "";
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`Chrome did not expose a DevTools port. stderr: ${stderr.slice(-2000)}`));
    }, 20_000);

    browser.stderr.setEncoding("utf8");
    browser.stderr.on("data", (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on ws:\/\/(?:127\.0\.0\.1|localhost|\[::1\]):(\d+)\//);
      if (!match || settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(Number.parseInt(match[1], 10));
    });

    browser.once("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new Error(`Chrome exited before DevTools was ready (code ${code}). stderr: ${stderr.slice(-2000)}`));
    });
  });
}

async function findPageWebSocket(port) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetchWithTimeout(`http://127.0.0.1:${port}/json/list`, {}, 2_000);
      if (response.ok) {
        const targets = await response.json();
        const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
        if (page) return page.webSocketDebuggerUrl;
      }
    } catch {
      // Chrome may need a moment after announcing the debugging endpoint.
    }
    await sleep(200);
  }
  throw new Error("Chrome DevTools did not expose a page target.");
}

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Timed out connecting to Chrome DevTools.")), 10_000);
      this.socket.addEventListener("open", () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      this.socket.addEventListener("error", () => {
        clearTimeout(timer);
        reject(new Error("Chrome DevTools WebSocket connection failed."));
      }, { once: true });
    });

    this.socket.addEventListener("message", (event) => {
      let message;
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
      else pending.resolve(message.result ?? {});
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(client, expression, awaitPromise = false) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
    userGesture: true,
  });
  if (response.exceptionDetails) {
    throw new Error(`Browser evaluation failed: ${response.exceptionDetails.text ?? "unknown exception"}`);
  }
  return response.result?.value;
}

async function navigateAndWait(client, url) {
  const navigation = await client.send("Page.navigate", { url });
  if (navigation.errorText) throw new Error(`Navigation failed for ${url}: ${navigation.errorText}`);

  const loaded = await evaluate(
    client,
    `(async () => {
      const deadline = Date.now() + 15000;
      while (document.readyState !== "complete" && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (document.readyState !== "complete") return false;
      if (document.fonts?.ready) await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return true;
    })()`,
    true,
  );

  if (!loaded) throw new Error(`Timed out waiting for the document to load: ${url}`);
}

async function inspectPage(client) {
  return evaluate(
    client,
    `(() => {
      const root = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(root?.scrollWidth ?? 0, body?.scrollWidth ?? 0);
      const innerWidth = window.innerWidth;
      const connector = document.querySelector(".how-connector");
      return {
        title: document.title,
        textLength: body?.innerText?.trim().length ?? 0,
        innerWidth,
        scrollWidth,
        overflow: Math.max(0, scrollWidth - innerWidth),
        connectorTransform: connector ? getComputedStyle(connector).transform : null,
        runtimeErrors: Array.isArray(window.__buildNumbersRuntimeErrors) ? window.__buildNumbersRuntimeErrors : [],
      };
    })()`,
  );
}

async function inspectHowItWorksLanding(client) {
  return evaluate(
    client,
    `(async () => {
      history.replaceState(null, "", location.pathname + location.search);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      location.hash = "how-it-works";
      await new Promise((resolve) => setTimeout(resolve, 700));

      const header = document.querySelector(".site-header");
      const section = document.querySelector("#how-it-works");
      const intro = section?.querySelector(".how-intro");
      if (!header || !section || !intro) return null;

      const headerRect = header.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const introRect = intro.getBoundingClientRect();
      const headerBottom = Math.max(0, headerRect.bottom);
      return {
        headerBottom,
        sectionTop: sectionRect.top,
        introTop: introRect.top,
        gap: introRect.top - headerBottom,
        viewportHeight: window.innerHeight,
      };
    })()`,
    true,
  );
}

async function stopBrowser(browser) {
  if (browser.exitCode !== null || browser.signalCode !== null) return;

  const gracefulExit = new Promise((resolve) => browser.once("exit", resolve));
  browser.kill("SIGTERM");
  await Promise.race([gracefulExit, sleep(1_500)]);

  if (browser.exitCode !== null || browser.signalCode !== null) return;

  const forcedExit = new Promise((resolve) => browser.once("exit", resolve));
  browser.kill("SIGKILL");
  await Promise.race([forcedExit, sleep(1_000)]);
}

const previewUrl = await findExactPreviewUrl();
const browserCommand = findBrowserCommand();
const profileDir = await mkdtemp(join(tmpdir(), "buildnumbers-browser-"));
const browser = spawn(
  browserCommand,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-background-networking",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

let client;
try {
  const port = await waitForDebugPort(browser);
  const pageWebSocket = await findPageWebSocket(port);
  client = new CdpClient(pageWebSocket);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      window.__buildNumbersRuntimeErrors = [];
      window.addEventListener("error", (event) => {
        if (!event.error && !event.message) return;
        window.__buildNumbersRuntimeErrors.push(String(event.message || event.error || "unknown error"));
      });
      window.addEventListener("unhandledrejection", (event) => {
        window.__buildNumbersRuntimeErrors.push("Unhandled rejection: " + String(event.reason || "unknown"));
      });
    `,
  });

  let checks = 0;
  for (const viewport of viewports) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.width <= 700,
    });

    for (const route of routes) {
      const target = new URL(route, previewUrl);
      target.searchParams.set("__qa_viewport", viewport.name);
      await navigateAndWait(client, target.href);
      const metrics = await inspectPage(client);

      if (!metrics || metrics.textLength < 80) {
        throw new Error(`${viewport.name} ${route}: page rendered too little visible text.`);
      }
      if (metrics.overflow > 1) {
        throw new Error(`${viewport.name} ${route}: horizontal overflow ${metrics.overflow}px (${metrics.scrollWidth}px > ${metrics.innerWidth}px).`);
      }
      if (metrics.runtimeErrors.length > 0) {
        throw new Error(`${viewport.name} ${route}: runtime errors: ${metrics.runtimeErrors.join(" | ")}`);
      }
      if (route === "/" && metrics.connectorTransform && metrics.connectorTransform !== "none") {
        throw new Error(`${viewport.name} homepage: workflow connector transform is ${metrics.connectorTransform}.`);
      }

      if (route === "/") {
        const landing = await inspectHowItWorksLanding(client);
        if (!landing) throw new Error(`${viewport.name} homepage: How it works landing elements are missing.`);
        if (landing.introTop < landing.headerBottom - 2) {
          throw new Error(`${viewport.name} homepage: How it works content is hidden behind the header (${landing.introTop}px < ${landing.headerBottom}px).`);
        }
        const maxGap = viewport.width <= 700 ? 180 : 220;
        if (landing.gap > maxGap) {
          throw new Error(`${viewport.name} homepage: How it works anchor leaves an oversized ${landing.gap}px visual gap (limit ${maxGap}px).`);
        }
        if (landing.introTop >= landing.viewportHeight) {
          throw new Error(`${viewport.name} homepage: How it works intro lands below the visible viewport.`);
        }
        console.log(`PASS ${viewport.name} ${route} — overflow 0px; How-it-works gap ${Math.round(landing.gap)}px`);
      } else {
        console.log(`PASS ${viewport.name} ${route} — overflow 0px`);
      }
      checks += 1;
    }
  }

  console.log(`Exact-preview browser matrix passed: ${checks}/${routes.length * viewports.length} route×viewport checks across 360×800, 768×900, and 1280×900.`);
} finally {
  client?.close();
  await stopBrowser(browser);
  await rm(profileDir, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 200,
  });
}
