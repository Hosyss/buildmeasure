import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const origin = "http://127.0.0.1:4173";
const debugOrigin = "http://127.0.0.1:9222";
const route = "/guides/how-many-bags-of-concrete-for-post-holes";
const screenshotRoot = "qa-artifacts/screenshots";
const browserErrors = [];
const report = { route, widths: {}, browserErrors, status: "pending" };

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function chromeExecutable() {
  for (const candidate of ["google-chrome", "chromium", "chromium-browser"]) {
    const result = spawnSync("which", [candidate], { encoding: "utf8" });
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  }
  throw new Error("No Chromium-compatible executable found.");
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const waiter = this.pending.get(message.id);
        if (!waiter) return;
        this.pending.delete(message.id);
        message.error
          ? waiter.reject(new Error(message.error.message))
          : waiter.resolve(message.result ?? {});
        return;
      }
      const listeners = this.events.get(message.method) ?? [];
      this.events.delete(message.method);
      for (const listener of listeners) listener(message.params ?? {});
      if (message.method === "Runtime.exceptionThrown") {
        browserErrors.push({
          type: "exception",
          text:
            message.params?.exceptionDetails?.exception?.description ??
            message.params?.exceptionDetails?.text ??
            "unknown",
        });
      }
      if (
        message.method === "Runtime.consoleAPICalled" &&
        message.params?.type === "error"
      ) {
        browserErrors.push({
          type: "console-error",
          text: (message.params.args ?? [])
            .map((arg) => arg.value ?? arg.description ?? "")
            .join(" "),
        });
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitFor(method, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`Timed out waiting for ${method}`)),
        timeoutMs,
      );
      const listeners = this.events.get(method) ?? [];
      listeners.push((params) => {
        clearTimeout(timeout);
        resolve(params);
      });
      this.events.set(method, listeners);
    });
  }

  close() {
    this.socket?.close();
  }
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text ??
        "Browser evaluation failed.",
    );
  }
  return result.result?.value;
}

async function screenshot(client, path, selector = null) {
  if (selector) {
    await evaluate(
      client,
      `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error("Missing screenshot target"); el.scrollIntoView({block:"center"}); })()`,
    );
    await delay(120);
  } else {
    await evaluate(client, "window.scrollTo(0, 0)");
    await delay(120);
  }
  const capture = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  await writeFile(path, capture.data, "base64");
}

await mkdir(screenshotRoot, { recursive: true });
const chromePath = chromeExecutable();
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--user-data-dir=/tmp/buildmeasure-post-hole-guide-qa",
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);
let chromeStderr = "";
chrome.stderr.on("data", (chunk) => {
  chromeStderr += chunk.toString();
});

try {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      if ((await fetch(`${debugOrigin}/json/version`)).ok) break;
    } catch {}
    if (attempt === 79) throw new Error("Chrome debugging endpoint did not become ready.");
    await delay(100);
  }

  const targetResponse = await fetch(`${debugOrigin}/json/new?about:blank`, {
    method: "PUT",
  });
  assert.equal(targetResponse.ok, true, "expected a Chrome debugging target");
  const target = await targetResponse.json();
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  const loaded = client.waitFor("Page.loadEventFired");
  await client.send("Page.navigate", { url: `${origin}${route}` });
  await loaded;
  await delay(600);

  const dismissed = await evaluate(
    client,
    `(() => {
      const norm = (value) => value.replace(/\\s+/g, " ").trim();
      const button = [...document.querySelectorAll("button")]
        .find((candidate) => norm(candidate.textContent ?? "") === "No thanks");
      if (!button) return false;
      button.click();
      return true;
    })()`,
  );
  if (dismissed) await delay(220);

  const content = await evaluate(
    client,
    `(() => ({
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() ?? "",
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
      text: document.body.textContent?.replace(/\\s+/g, " ").trim() ?? "",
      faqCount: document.querySelectorAll(".guide-faq details").length,
      tableRows: document.querySelectorAll("#examples tbody tr").length,
      primaryHref: document.querySelector(".guide-primary-action")?.getAttribute("href") ?? "",
      structured: [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => node.textContent ?? "").join(" "),
      consentVisible: [...document.querySelectorAll("button")].some((candidate) => (candidate.textContent ?? "").replace(/\\s+/g, " ").trim() === "No thanks"),
    }))()`,
  );

  assert.equal(content.h1, "How many bags of concrete do I need for post holes?");
  assert.match(content.canonical, /\/guides\/how-many-bags-of-concrete-for-post-holes$/);
  assert.equal(content.faqCount, 5);
  assert.equal(content.tableRows, 5);
  assert.equal(content.primaryHref, "/post-hole-concrete-calculator");
  assert.equal(content.consentVisible, false, "analytics consent should not obscure visual QA");
  assert.match(content.structured, /"FAQPage"/);
  assert.match(content.structured, /"Article"/);
  assert.match(content.text, /11 bags/);
  assert.match(content.text, /24 × 40 lb/);
  assert.match(content.text, /16 × 60 lb/);
  assert.match(content.text, /12 × 80 lb/);
  assert.match(content.text, /not recommended hole dimensions/i);
  assert.match(content.text, /does not choose structural or code dimensions/i);
  assert.match(content.text, /BuildMeasure does not choose structural or code dimensions for you/i);

  const secondFaqOpened = await evaluate(
    client,
    `(() => {
      const detail = document.querySelectorAll(".guide-faq details")[1];
      const summary = detail?.querySelector("summary");
      if (!detail || !summary) throw new Error("Missing second FAQ");
      if (!detail.open) summary.click();
      return detail.open;
    })()`,
  );
  assert.equal(secondFaqOpened, true, "FAQ should remain interactive after hydration");

  for (const width of [360, 768, 1280]) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: width === 360 ? 800 : 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await delay(150);
    const dimensions = await evaluate(
      client,
      `(() => ({
        innerWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        tableScrollWidth: document.querySelector(".guide-table-wrap")?.scrollWidth ?? 0,
        tableClientWidth: document.querySelector(".guide-table-wrap")?.clientWidth ?? 0,
      }))()`,
    );
    assert.equal(dimensions.innerWidth, width);
    assert.ok(dimensions.documentWidth <= width, `document overflow at ${width}: ${JSON.stringify(dimensions)}`);
    assert.ok(dimensions.bodyWidth <= width, `body overflow at ${width}: ${JSON.stringify(dimensions)}`);
    report.widths[width] = dimensions;

    if (width === 360) {
      await screenshot(client, `${screenshotRoot}/post-hole-guide-360-top.png`);
      await screenshot(client, `${screenshotRoot}/post-hole-guide-360-table.png`, "#examples");
    }
    if (width === 1280) {
      await screenshot(client, `${screenshotRoot}/post-hole-guide-1280-top.png`);
      await screenshot(client, `${screenshotRoot}/post-hole-guide-1280-table.png`, "#examples");
    }
  }

  assert.deepEqual(browserErrors, [], `browser errors: ${JSON.stringify(browserErrors)}`);
  report.status = "passed";
  report.content = {
    title: content.title,
    h1: content.h1,
    canonical: content.canonical,
    faqCount: content.faqCount,
    tableRows: content.tableRows,
    primaryHref: content.primaryHref,
  };
  client.close();
} catch (error) {
  report.status = "failed";
  report.error = error instanceof Error ? error.stack ?? error.message : String(error);
  throw error;
} finally {
  chrome.kill("SIGTERM");
  await writeFile("qa-artifacts/post-hole-guide-browser-qa.json", `${JSON.stringify(report, null, 2)}\n`);
  if (chromeStderr) await writeFile("qa-artifacts/chrome-stderr.log", chromeStderr);
}

console.log(`Post-hole guide browser QA passed: ${JSON.stringify(report)}`);
