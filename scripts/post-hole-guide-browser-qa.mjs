import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const origin = "http://127.0.0.1:4173";
const debuggingOrigin = "http://127.0.0.1:9222";
const guidePath = "/guides/how-many-bags-of-concrete-for-post-holes";
const canonicalGuide = `https://buildmeasure.buildtools.workers.dev${guidePath}`;
const artifactRoot = "qa-artifacts";
const screenshotRoot = `${artifactRoot}/guide-screenshots`;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function chromeExecutable() {
  for (const candidate of ["google-chrome", "chromium", "chromium-browser"]) {
    const result = spawnSync("which", [candidate], { encoding: "utf8" });
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  }
  throw new Error("No Chromium-compatible browser executable was found.");
}

async function waitForDebuggingEndpoint() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`${debuggingOrigin}/json/version`);
      if (response.ok) return;
    } catch {
      // Browser is still starting.
    }
    await delay(100);
  }
  throw new Error("Chrome remote debugging endpoint did not become ready.");
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("CDP websocket timed out.")), 5000);
      this.socket.addEventListener("open", () => {
        clearTimeout(timeout);
        resolve();
      });
      this.socket.addEventListener("error", (event) => {
        clearTimeout(timeout);
        reject(new Error(`CDP websocket error: ${String(event?.message ?? "unknown")}`));
      });
    });

    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
        else pending.resolve(message.result ?? {});
        return;
      }

      const waiters = this.eventWaiters.get(message.method) ?? [];
      this.eventWaiters.delete(message.method);
      for (const waiter of waiters) waiter(message.params ?? {});
      this.onEvent?.(message.method, message.params ?? {});
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
      const waiters = this.eventWaiters.get(method) ?? [];
      waiters.push((params) => {
        clearTimeout(timeout);
        resolve(params);
      });
      this.eventWaiters.set(method, waiters);
    });
  }

  close() {
    this.socket?.close();
  }
}

async function createClient() {
  const response = await fetch(`${debuggingOrigin}/json/new?about:blank`, { method: "PUT" });
  assert.equal(response.ok, true, `Unable to create Chrome target: HTTP ${response.status}`);
  const target = await response.json();
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Log.enable");
  return client;
}

async function evaluate(client, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(
      response.exceptionDetails.exception?.description ??
        response.exceptionDetails.text ??
        "Browser evaluation failed.",
    );
  }
  return response.result?.value;
}

async function setViewport(client, width, height = 900) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await delay(120);
}

async function navigate(client, path) {
  const loaded = client.waitForEvent("Page.loadEventFired");
  await client.send("Page.navigate", { url: `${origin}${path}` });
  await loaded;
  await delay(500);

  const dismissed = await evaluate(
    client,
    `(() => {
      const normalize = (value) => value.replace(/\\s+/g, " ").trim();
      const button = [...document.querySelectorAll("button")]
        .find((candidate) => normalize(candidate.textContent ?? "") === "No thanks");
      if (!button) return false;
      button.click();
      return true;
    })()`,
  );
  if (dismissed) await delay(250);
}

async function capture(client, filePath) {
  const metrics = await client.send("Page.getLayoutMetrics");
  const content = metrics.cssContentSize ?? metrics.contentSize;
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width: Math.max(1, content.width),
      height: Math.max(1, content.height),
      scale: 1,
    },
  });
  await writeFile(filePath, Buffer.from(result.data, "base64"));
}

async function inspectGuide(client) {
  return evaluate(
    client,
    `(() => {
      const normalize = (value) => (value ?? "").replace(/\\s+/g, " ").trim();
      const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .flatMap((node) => {
          try {
            const parsed = JSON.parse(node.textContent ?? "null");
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [];
          }
        })
        .filter(Boolean);
      const schemaTypes = schemas.map((schema) => schema["@type"]);
      const headings = [...document.querySelectorAll("h2")].map((node) => normalize(node.textContent));
      const calculatorLink = document.querySelector('a[href="/post-hole-concrete-calculator"]');
      const slabGuideLink = document.querySelector('a[href="/guides/how-many-bags-of-concrete"]');
      const sourceLink = document.querySelector('a[href^="https://www.sakrete.com/product/high-strength-concrete-mix"]');
      const consentVisible = [...document.querySelectorAll("button")]
        .some((button) => normalize(button.textContent) === "No thanks");
      return {
        title: document.title,
        h1: normalize(document.querySelector("h1")?.textContent),
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
        bodyText: normalize(document.body.textContent),
        schemaTypes,
        headings,
        hasCalculatorLink: Boolean(calculatorLink),
        hasSlabGuideLink: Boolean(slabGuideLink),
        hasSourceLink: Boolean(sourceLink),
        consentVisible,
        innerWidth: window.innerWidth,
        documentClientWidth: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      };
    })()`,
  );
}

async function inspectEntryPoint(client, path) {
  await navigate(client, path);
  return evaluate(
    client,
    `(() => ({
      hasGuideLink: Boolean(document.querySelector('a[href="${guidePath}"]')),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))()`,
  );
}

await mkdir(screenshotRoot, { recursive: true });
const executable = chromeExecutable();
console.log(`Using Chrome: ${executable}`);

const chrome = spawn(
  executable,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--hide-scrollbars",
    "--user-data-dir=/tmp/buildmeasure-post-hole-guide-qa-chrome",
    "--remote-debugging-port=9222",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

let chromeStderr = "";
chrome.stderr.on("data", (chunk) => {
  chromeStderr += chunk.toString();
});

try {
  await waitForDebuggingEndpoint();
  const client = await createClient();
  const browserErrors = [];

  client.onEvent = (method, params) => {
    if (method === "Runtime.exceptionThrown") {
      browserErrors.push({
        kind: "exception",
        text: params.exceptionDetails?.exception?.description ?? params.exceptionDetails?.text ?? "unknown exception",
      });
    }
    if (method === "Runtime.consoleAPICalled" && params.type === "error") {
      browserErrors.push({
        kind: "console-error",
        text: (params.args ?? []).map((arg) => arg.value ?? arg.description ?? "").join(" "),
      });
    }
    if (method === "Log.entryAdded" && params.entry?.level === "error") {
      browserErrors.push({ kind: "log-error", text: params.entry.text ?? "unknown log error" });
    }
  };

  const responsive = {};
  for (const width of [360, 768, 1280]) {
    await setViewport(client, width);
    await navigate(client, guidePath);
    const state = await inspectGuide(client);

    assert.match(state.title, /How Many Bags of Concrete for Post Holes\?/i);
    assert.equal(state.h1, "How many bags of concrete do I need for post holes?");
    assert.equal(state.canonical, canonicalGuide);
    assert.equal(state.schemaTypes.includes("Article"), true);
    assert.equal(state.schemaTypes.includes("BreadcrumbList"), true);
    assert.equal(state.schemaTypes.includes("FAQPage"), true);
    assert.equal(state.schemaTypes.includes("HowTo"), false);
    assert.equal(state.hasCalculatorLink, true);
    assert.equal(state.hasSlabGuideLink, true);
    assert.equal(state.hasSourceLink, true);
    assert.equal(state.consentVisible, false, "analytics consent should not obscure QA evidence");
    assert.match(state.bodyText, /not a recommended hole size/i);
    assert.match(state.bodyText, /1\.570796 ft³/);
    assert.match(state.bodyText, /3 complete bags/);
    assert.ok(
      state.documentScrollWidth <= state.documentClientWidth + 1,
      `horizontal document overflow at ${width}px: ${state.documentScrollWidth} > ${state.documentClientWidth}`,
    );
    assert.ok(
      state.bodyScrollWidth <= state.documentClientWidth + 1,
      `horizontal body overflow at ${width}px: ${state.bodyScrollWidth} > ${state.documentClientWidth}`,
    );

    await capture(client, `${screenshotRoot}/post-hole-guide-${width}.png`);
    responsive[width] = state;
  }

  await setViewport(client, 1280);
  const home = await inspectEntryPoint(client, "/");
  assert.equal(home.hasGuideLink, true, "homepage should link to the post-hole guide");
  assert.ok(home.scrollWidth <= home.clientWidth + 1, "homepage should not overflow horizontally");

  const calculator = await inspectEntryPoint(client, "/post-hole-concrete-calculator");
  assert.equal(calculator.hasGuideLink, true, "post-hole calculator should link to the guide");
  assert.ok(calculator.scrollWidth <= calculator.clientWidth + 1, "post-hole calculator should not overflow horizontally");

  assert.deepEqual(browserErrors, [], `browser errors detected: ${JSON.stringify(browserErrors)}`);

  const evidence = {
    guidePath,
    canonicalGuide,
    responsive,
    entryPoints: { home, calculator },
    browserErrors,
    status: "passed",
  };
  await writeFile(`${artifactRoot}/post-hole-guide-browser-qa.json`, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log("Post-hole guide browser QA passed at 360, 768, and 1280 px.");
  client.close();
} catch (error) {
  await writeFile(`${artifactRoot}/chrome-stderr.log`, chromeStderr);
  throw error;
} finally {
  chrome.kill("SIGTERM");
  await delay(250);
  if (!chrome.killed) chrome.kill("SIGKILL");
}
