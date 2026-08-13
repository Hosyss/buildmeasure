import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const origin = "http://127.0.0.1:4173";
const debuggingOrigin = "http://127.0.0.1:9222";
const route = "/guides/how-many-bricks-do-i-need";
const evidenceDir = "qa-artifacts/brick-guide";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function chromeExecutable() {
  for (const candidate of ["google-chrome", "chromium", "chromium-browser"]) {
    const result = spawnSync("which", [candidate], { encoding: "utf8" });
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  }
  throw new Error("No Chromium-compatible browser found");
}

class Cdp {
  constructor(url) { this.url = url; this.nextId = 1; this.pending = new Map(); this.waiters = new Map(); }
  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("CDP connect timeout")), 5000);
      this.ws.addEventListener("open", () => { clearTimeout(timer); resolve(); });
      this.ws.addEventListener("error", () => { clearTimeout(timer); reject(new Error("CDP websocket error")); });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id); if (!pending) return;
        this.pending.delete(message.id);
        return message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result ?? {});
      }
      this.onEvent?.(message.method, message.params ?? {});
      const list = this.waiters.get(message.method) ?? [];
      this.waiters.delete(message.method);
      for (const resolve of list) resolve(message.params ?? {});
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  wait(method, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeout);
      const list = this.waiters.get(method) ?? [];
      list.push((value) => { clearTimeout(timer); resolve(value); });
      this.waiters.set(method, list);
    });
  }
  close() { this.ws?.close(); }
}

async function waitForChrome() {
  for (let i = 0; i < 100; i += 1) {
    try { if ((await fetch(`${debuggingOrigin}/json/version`)).ok) return; } catch {}
    await delay(100);
  }
  throw new Error("Chrome debugging endpoint did not become ready");
}

async function createClient() {
  const response = await fetch(`${debuggingOrigin}/json/new?about:blank`, { method: "PUT" });
  assert.equal(response.ok, true);
  const target = await response.json();
  const client = new Cdp(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable"); await client.send("Runtime.enable"); await client.send("Log.enable");
  return client;
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? "Browser evaluation failed");
  return result.result?.value;
}

async function navigate(client, path = route) {
  const loaded = client.wait("Page.loadEventFired");
  await client.send("Page.navigate", { url: `${origin}${path}` });
  await loaded; await delay(450);
  await evaluate(client, `(() => { const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='No thanks'); if(b)b.click(); return true; })()`);
  await delay(150);
}

async function viewport(client, width, height = 900) {
  await client.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await delay(100);
}

await mkdir(evidenceDir, { recursive: true });
const chrome = spawn(chromeExecutable(), ["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--user-data-dir=/tmp/buildmeasure-brick-guide-qa","--remote-debugging-port=9222","about:blank"], { stdio: ["ignore","ignore","pipe"] });
let stderr = ""; chrome.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

try {
  await waitForChrome();
  const client = await createClient();
  const browserErrors = [];
  client.onEvent = (method, params) => {
    if (method === "Runtime.exceptionThrown") browserErrors.push(params.exceptionDetails?.exception?.description ?? params.exceptionDetails?.text ?? "exception");
    if (method === "Runtime.consoleAPICalled" && params.type === "error") browserErrors.push((params.args ?? []).map((x) => x.value ?? x.description ?? "").join(" "));
    if (method === "Log.entryAdded" && params.entry?.level === "error") browserErrors.push(params.entry.text ?? "log error");
  };

  const responsive = {};
  for (const width of [360, 768, 1280]) {
    await viewport(client, width);
    await navigate(client);
    const state = await evaluate(client, `(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      h1: document.querySelector('h1')?.textContent?.replace(/\\s+/g,' ').trim(),
      text: document.body.textContent?.replace(/\\s+/g,' ').trim(),
      calculatorHref: document.querySelector('a[href="/brick-calculator"]')?.getAttribute('href'),
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      tableWidth: document.querySelector('.guide-table-wrap')?.scrollWidth ?? null,
      tableClient: document.querySelector('.guide-table-wrap')?.clientWidth ?? null
    }))()`);
    assert.equal(state.innerWidth, width);
    assert.ok(state.scrollWidth <= state.clientWidth + 1, `document overflow at ${width}: ${JSON.stringify(state)}`);
    assert.ok(state.bodyScrollWidth <= state.clientWidth + 1, `body overflow at ${width}: ${JSON.stringify(state)}`);
    assert.match(state.h1 ?? "", /How many bricks do I need for a wall\?/i);
    assert.match(state.text ?? "", /675 Modular bricks per 100 ft²/);
    assert.match(state.text ?? "", /1,021 bricks/);
    assert.equal(state.calculatorHref, "/brick-calculator");
    assert.equal(state.canonical, "https://buildmeasure.buildtools.workers.dev/guides/how-many-bricks-do-i-need");
    responsive[width] = state;
  }

  await viewport(client, 1280);
  await navigate(client, "/");
  assert.equal(await evaluate(client, `Boolean(document.querySelector('a[href="/guides/how-many-bricks-do-i-need"]'))`), true);
  await navigate(client, "/brick-calculator");
  assert.equal(await evaluate(client, `Boolean(document.querySelector('a[href="/guides/how-many-bricks-do-i-need"]'))`), true);
  assert.deepEqual(browserErrors, [], `browser errors: ${JSON.stringify(browserErrors)}`);

  const report = { status: "passed", route, responsive, browserErrors };
  await writeFile(`${evidenceDir}/browser-qa.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log("Brick guide supervised browser QA passed.");
  client.close();
} catch (error) {
  await writeFile(`${evidenceDir}/browser-qa-error.txt`, `${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  await writeFile(`${evidenceDir}/chrome-stderr.log`, stderr);
  throw error;
} finally {
  chrome.kill("SIGTERM"); await delay(200); if (!chrome.killed) chrome.kill("SIGKILL");
}
