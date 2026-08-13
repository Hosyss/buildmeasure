import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const origin = "http://127.0.0.1:4173";
const debuggingOrigin = "http://127.0.0.1:9222";
const route = "/brick-calculator";
const artifactRoot = "qa-artifacts";
const screenshotRoot = `${artifactRoot}/brick-screenshots`;

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
      // Chrome is still starting.
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

async function navigate(client) {
  const loaded = client.waitForEvent("Page.loadEventFired");
  await client.send("Page.navigate", { url: `${origin}${route}` });
  await loaded;
  await delay(500);
  const dismissed = await evaluate(
    client,
    `(() => {
      const normalize = (value) => (value ?? "").replace(/\\s+/g, " ").trim();
      const button = [...document.querySelectorAll("button")]
        .find((candidate) => normalize(candidate.textContent) === "No thanks");
      if (!button) return false;
      button.click();
      return true;
    })()`,
  );
  if (dismissed) await delay(220);
}

async function clickButton(client, text) {
  await evaluate(
    client,
    `(() => {
      const normalize = (value) => (value ?? "").replace(/\\s+/g, " ").trim();
      const button = [...document.querySelectorAll("button")]
        .find((candidate) => normalize(candidate.textContent).includes(${JSON.stringify(text)}));
      if (!button) throw new Error("Missing button: " + ${JSON.stringify(text)});
      button.click();
      return true;
    })()`,
  );
  await delay(180);
}

async function setInputByLabel(client, labelText, value) {
  await evaluate(
    client,
    `(() => {
      const normalize = (value) => (value ?? "").replace(/\\s+/g, " ").trim();
      const label = [...document.querySelectorAll("label")]
        .find((candidate) => normalize(candidate.querySelector(":scope > span")?.textContent).startsWith(${JSON.stringify(labelText)}));
      if (!label) throw new Error("Missing label: " + ${JSON.stringify(labelText)});
      const input = label.querySelector("input");
      if (!(input instanceof HTMLInputElement)) throw new Error("Missing input for label: " + ${JSON.stringify(labelText)});
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(input, ${JSON.stringify(String(value))});
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return { value: input.value, readOnly: input.readOnly };
    })()`,
  );
  await delay(180);
}

async function selectByLabel(client, labelText, value) {
  await evaluate(
    client,
    `(() => {
      const normalize = (value) => (value ?? "").replace(/\\s+/g, " ").trim();
      const label = [...document.querySelectorAll("label")]
        .find((candidate) => normalize(candidate.querySelector(":scope > span")?.textContent).startsWith(${JSON.stringify(labelText)}));
      if (!label) throw new Error("Missing label: " + ${JSON.stringify(labelText)});
      const select = label.querySelector("select");
      if (!(select instanceof HTMLSelectElement)) throw new Error("Missing select for label: " + ${JSON.stringify(labelText)});
      const option = [...select.options].find((candidate) => candidate.value === ${JSON.stringify(value)});
      if (!option) throw new Error("Missing option: " + ${JSON.stringify(value)});
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set;
      setter.call(select, option.value);
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return select.value;
    })()`,
  );
  await delay(220);
}

async function switchSystem(client, system) {
  await evaluate(
    client,
    `(() => {
      const normalize = (value) => (value ?? "").replace(/\\s+/g, " ").trim();
      const button = [...document.querySelectorAll("button")]
        .find((candidate) => normalize(candidate.textContent).startsWith(${JSON.stringify(system)}));
      if (!button) throw new Error("Missing unit button: " + ${JSON.stringify(system)});
      if (button.getAttribute("aria-pressed") !== "true") button.click();
      return true;
    })()`,
  );
  await delay(220);
}

async function state(client) {
  return evaluate(
    client,
    `(() => {
      const normalize = (value) => (value ?? "").replace(/\\s+/g, " ").trim();
      const findLabel = (text) => [...document.querySelectorAll("label")]
        .find((candidate) => normalize(candidate.querySelector(":scope > span")?.textContent).startsWith(text));
      const inputValue = (text) => findLabel(text)?.querySelector("input")?.value ?? null;
      const selectValue = (text) => findLabel(text)?.querySelector("select")?.value ?? null;
      const coverage = findLabel("Brick coverage rate")?.querySelector("input");
      const primary = document.querySelector(".primary-result");
      const summaries = [...document.querySelectorAll(".surface-summary")].map((element) => normalize(element.textContent));
      const costSummary = summaries.find((text) => text.includes("Estimated material cost")) ?? null;
      const resultBreakdown = normalize(document.querySelector(".result-breakdown")?.textContent);
      const quantityError = normalize(document.querySelector("#brick-error")?.textContent);
      const costError = normalize(document.querySelector("#brick-cost-error")?.textContent);
      const price = document.querySelector('input[aria-label="Price per brick"]');
      const currency = document.querySelector('input[placeholder="$' + ', EUR, EGP"]');
      const notice = normalize(document.querySelector(".calculator-notice")?.textContent);
      const history = normalize(document.querySelector(".history-panel")?.textContent);
      return {
        wallLength: inputValue("Wall length"),
        wallHeight: inputValue("Wall height"),
        openingsArea: inputValue("Doors & windows"),
        coverageRate: coverage?.value ?? null,
        coverageReadOnly: coverage?.readOnly ?? null,
        wastePercent: inputValue("Waste / breakage"),
        brickChoice: selectValue("Brick coverage basis"),
        primary: normalize(primary?.textContent),
        resultBreakdown,
        summaries,
        costSummary,
        quantityError,
        costError,
        price: price?.value ?? null,
        currency: currency?.value ?? null,
        notice,
        history,
        body: normalize(document.body.textContent),
      };
    })()`,
  );
}

function assertOrder(stateValue, order) {
  assert.match(stateValue.primary, new RegExp(`Bricks to order\\s*${order.toLocaleString("en-US")}\\s*bricks`));
}

async function resetImperial(client) {
  await switchSystem(client, "Imperial");
  await clickButton(client, "Reset");
}

async function setKnownWall(client, { waste = "0", preset = "modular" } = {}) {
  await resetImperial(client);
  await setInputByLabel(client, "Wall length", "10");
  await setInputByLabel(client, "Wall height", "10");
  await setInputByLabel(client, "Doors & windows", "0");
  await selectByLabel(client, "Brick coverage basis", preset);
  await setInputByLabel(client, "Waste / breakage", waste);
  return state(client);
}

async function setPrice(client, price, currency = "EGP") {
  await evaluate(
    client,
    `(() => {
      const input = document.querySelector('input[placeholder="$' + ', EUR, EGP"]');
      if (!(input instanceof HTMLInputElement)) throw new Error("Missing currency input");
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(input, ${JSON.stringify(currency)});
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    })()`,
  );
  await setInputByLabel(client, "Optional price per", price);
  return state(client);
}

async function setViewport(client, width, height = 900) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await delay(150);
}

async function responsiveState(client) {
  return evaluate(
    client,
    `(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      panelRight: document.querySelector(".calculator-panel")?.getBoundingClientRect().right ?? null,
      resultRight: document.querySelector(".result-panel")?.getBoundingClientRect().right ?? null,
    }))()`,
  );
}

async function capture(client, path) {
  const metrics = await client.send("Page.getLayoutMetrics");
  const content = metrics.cssContentSize ?? metrics.contentSize;
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: Math.max(1, content.width), height: Math.max(1, content.height), scale: 1 },
  });
  await writeFile(path, Buffer.from(result.data, "base64"));
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
    "--user-data-dir=/tmp/buildmeasure-brick-qa-chrome",
    "--remote-debugging-port=9222",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

let chromeStderr = "";
chrome.stderr.on("data", (chunk) => { chromeStderr += chunk.toString(); });

try {
  await waitForDebuggingEndpoint();
  const client = await createClient();
  const browserErrors = [];
  client.onEvent = (method, params) => {
    if (method === "Runtime.exceptionThrown") {
      browserErrors.push({ kind: "exception", text: params.exceptionDetails?.exception?.description ?? params.exceptionDetails?.text ?? "unknown exception" });
    }
    if (method === "Runtime.consoleAPICalled" && params.type === "error") {
      browserErrors.push({ kind: "console-error", text: (params.args ?? []).map((arg) => arg.value ?? arg.description ?? "").join(" ") });
    }
    if (method === "Log.entryAdded" && params.entry?.level === "error") {
      browserErrors.push({ kind: "log-error", text: params.entry.text ?? "unknown log error" });
    }
  };

  await navigate(client);
  let current = await state(client);
  assertOrder(current, 1021);
  assert.equal(current.brickChoice, "modular");
  assert.equal(current.coverageRate, "675");
  assert.equal(current.coverageReadOnly, true);
  assert.match(current.resultBreakdown, /Net brick area\s*144 ft²/);
  assert.match(current.body, /fired-clay brick/i);
  assert.match(current.body, /Running \/ stack only/);
  assert.match(current.body, /does not estimate mortar/i);

  current = await setKnownWall(client, { waste: "0", preset: "modular" });
  assertOrder(current, 675);
  current = await setKnownWall(client, { waste: "5", preset: "modular" });
  assertOrder(current, 709);
  current = await setKnownWall(client, { waste: "0", preset: "standard" });
  assertOrder(current, 655);

  const presetRates = {
    modular: "675",
    "engineer-modular": "563",
    "closure-modular": "450",
    roman: "600",
    norman: "450",
    utility: "300",
    meridian: "225",
    standard: "655",
  };
  await resetImperial(client);
  for (const [preset, rate] of Object.entries(presetRates)) {
    await selectByLabel(client, "Brick coverage basis", preset);
    current = await state(client);
    assert.equal(current.coverageRate, rate, `unexpected rate for ${preset}`);
    assert.equal(current.coverageReadOnly, true);
  }

  await selectByLabel(client, "Brick coverage basis", "custom");
  current = await state(client);
  assert.equal(current.coverageReadOnly, false);
  await setInputByLabel(client, "Brick coverage rate", "700");
  current = await state(client);
  assert.equal(current.quantityError, "");
  assert.match(current.primary, /Bricks to order/);

  await setInputByLabel(client, "Brick coverage rate", "0");
  current = await state(client);
  assert.match(current.quantityError, /coverage rate must be greater than zero/i);
  await setInputByLabel(client, "Brick coverage rate", "700");

  await resetImperial(client);
  await setInputByLabel(client, "Doors & windows", "160");
  current = await state(client);
  assert.match(current.quantityError, /smaller than the gross wall area/i);

  for (const waste of ["0", "5", "25", "50"]) {
    current = await setKnownWall(client, { waste, preset: "modular" });
    assert.equal(current.quantityError, "");
    assert.match(current.primary, /Bricks to order/);
  }
  await setInputByLabel(client, "Waste / breakage", "51");
  current = await state(client);
  assert.match(current.quantityError, /between 0% and 50%/i);

  await resetImperial(client);
  const beforeUnits = await state(client);
  const beforeOrder = beforeUnits.primary;
  await switchSystem(client, "Metric");
  const metric = await state(client);
  assert.equal(metric.primary, beforeOrder);
  assert.notEqual(metric.wallLength, beforeUnits.wallLength);
  assert.notEqual(metric.coverageRate, beforeUnits.coverageRate);
  await switchSystem(client, "Imperial");
  const roundTrip = await state(client);
  assert.equal(roundTrip.primary, beforeOrder);
  assert.ok(Math.abs(Number(roundTrip.wallLength) - 20) < 1e-6);
  assert.ok(Math.abs(Number(roundTrip.wallHeight) - 8) < 1e-6);
  assert.ok(Math.abs(Number(roundTrip.openingsArea) - 16) < 1e-6);
  assert.ok(Math.abs(Number(roundTrip.coverageRate) - 675) < 1e-5);

  await resetImperial(client);
  const blankCost = await state(client);
  assert.equal(blankCost.price, "");
  assert.equal(blankCost.costSummary, null);
  current = await setPrice(client, "10", "EGP");
  assert.match(current.costSummary, /Estimated material cost\s*EGP 10,210/);
  assert.match(current.costSummary, /1021\s*× EGP 10\.00 per brick/);
  await selectByLabel(client, "Brick coverage basis", "standard");
  current = await state(client);
  assert.equal(current.price, "", "changing brick product definition must clear stale unit price");

  await resetImperial(client);
  await setPrice(client, "10", "EGP");
  await switchSystem(client, "Metric");
  current = await state(client);
  assert.equal(current.price, "10", "unit-system conversion should preserve the same brick price");
  assert.match(current.costSummary, /EGP/);

  await resetImperial(client);
  await setPrice(client, "-1", "EGP");
  current = await state(client);
  assert.match(current.costError, /cannot be negative/i);
  assertOrder(current, 1021);

  await resetImperial(client);
  await evaluate(
    client,
    `Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text) => { window.__brickCopied = text; } } }); window.print = () => { window.__brickPrinted = true; }; true`,
  );
  await clickButton(client, "Copy");
  const copied = await evaluate(client, `window.__brickCopied ?? null`);
  assert.match(copied, /1021 bricks to order/);
  assert.match(copied, /Scope: fired-clay brick/);
  await clickButton(client, "Save");
  current = await state(client);
  assert.match(current.history, /1021 bricks to order/);
  await clickButton(client, "Print");
  const printed = await evaluate(client, `window.__brickPrinted === true`);
  assert.equal(printed, true);
  await clickButton(client, "Clear all");
  current = await state(client);
  assert.doesNotMatch(current.history, /1021 bricks to order/);

  await clickButton(client, "Reset");
  current = await state(client);
  assert.equal(current.wallLength, "20");
  assert.equal(current.wallHeight, "8");
  assert.equal(current.openingsArea, "16");
  assert.equal(current.brickChoice, "modular");
  assert.equal(current.wastePercent, "5");
  assert.equal(current.price, "");
  assertOrder(current, 1021);

  const focusableSummary = await evaluate(
    client,
    `(() => {
      const visible = (element) => Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
      return [...document.querySelectorAll('button, input, select, a[href]')]
        .filter((element) => visible(element) && !element.disabled)
        .map((element) => (element.getAttribute('aria-label') || element.textContent || element.getAttribute('placeholder') || element.tagName).replace(/\\s+/g, ' ').trim())
        .filter(Boolean);
    })()`,
  );
  for (const expected of ["Imperial", "Metric", "Reset", "Modular", "Price per brick", "Copy", "Save", "Print", "Report a calculation issue"]) {
    assert.equal(
      focusableSummary.some((entry) => entry.includes(expected)),
      true,
      `expected a keyboard-focusable control containing ${expected}`,
    );
  }

  const responsive = {};
  for (const width of [360, 768, 1280]) {
    await setViewport(client, width);
    await navigate(client);
    const dimensions = await responsiveState(client);
    assert.equal(dimensions.innerWidth, width);
    assert.ok(dimensions.scrollWidth <= dimensions.clientWidth + 1, `document overflow at ${width}: ${JSON.stringify(dimensions)}`);
    assert.ok(dimensions.bodyScrollWidth <= dimensions.clientWidth + 1, `body overflow at ${width}: ${JSON.stringify(dimensions)}`);
    responsive[width] = dimensions;
    await capture(client, `${screenshotRoot}/brick-${width}.png`);
  }

  assert.deepEqual(browserErrors, [], `browser errors detected: ${JSON.stringify(browserErrors)}`);

  const report = {
    route,
    knownVectors: {
      defaultOrder: 1021,
      modular0: 675,
      modular5: 709,
      standard0: 655,
    },
    presets: presetRates,
    responsive,
    browserErrors,
    status: "passed",
  };
  await writeFile(`${artifactRoot}/brick-browser-qa.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log("Supervised Brick Calculator browser QA passed.");
  client.close();
} catch (error) {
  await writeFile(`${artifactRoot}/chrome-stderr.log`, chromeStderr);
  await writeFile(
    `${artifactRoot}/browser-qa-error.txt`,
    `${error instanceof Error ? error.stack ?? error.message : String(error)}\n`,
  );
  throw error;
} finally {
  chrome.kill("SIGTERM");
  await delay(250);
  if (!chrome.killed) chrome.kill("SIGKILL");
}
