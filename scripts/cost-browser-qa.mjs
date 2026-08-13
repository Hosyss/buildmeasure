import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const origin = "http://127.0.0.1:4173";
const debuggingOrigin = "http://127.0.0.1:9222";
const artifactRoot = "qa-artifacts";
const screenshotRoot = `${artifactRoot}/screenshots`;

const routes = [
  {
    path: "/concrete-calculator",
    slug: "concrete",
    productLabel: "Bag size",
    metricPriceBehavior: "preserve",
  },
  {
    path: "/post-hole-concrete-calculator",
    slug: "post-hole",
    productLabel: "Bag size",
    metricPriceBehavior: "preserve",
  },
  {
    path: "/paint-calculator",
    slug: "paint",
    productLabel: "Container size",
    metricPriceBehavior: "clear",
  },
  {
    path: "/tile-calculator",
    slug: "tile",
    productLabel: "Tiles per box",
    metricPriceBehavior: "preserve",
  },
  {
    path: "/gravel-calculator",
    slug: "gravel",
    productLabel: "Bag weight",
    metricPriceBehavior: "preserve",
  },
  {
    path: "/mulch-calculator",
    slug: "mulch",
    productLabel: "Volume per bag",
    metricPriceBehavior: "preserve",
  },
];

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
  for (let attempt = 0; attempt < 80; attempt += 1) {
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
        if (message.error) {
          pending.reject(new Error(`${pending.method}: ${message.error.message}`));
        } else {
          pending.resolve(message.result ?? {});
        }
        return;
      }

      const waiters = this.eventWaiters.get(message.method) ?? [];
      this.eventWaiters.delete(message.method);
      for (const waiter of waiters) waiter(message.params ?? {});
      this.onEvent?.(message.method, message.params ?? {});
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
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
  const response = await fetch(`${debuggingOrigin}/json/new?about:blank`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error(`Unable to create Chrome target: HTTP ${response.status}`);
  }
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

async function navigate(client, path) {
  const loaded = client.waitForEvent("Page.loadEventFired");
  await client.send("Page.navigate", { url: `${origin}${path}` });
  await loaded;
  await delay(450);
}

async function setInput(client, selector, value) {
  const actual = await evaluate(
    client,
    `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!(element instanceof HTMLInputElement)) {
        throw new Error("Missing input: " + ${JSON.stringify(selector)});
      }
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(element, ${JSON.stringify(String(value))});
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return element.value;
    })()`,
  );
  await delay(140);
  return actual;
}

async function clickButton(client, text) {
  await evaluate(
    client,
    `(() => {
      const normalize = (value) => value.replace(/\\s+/g, " ").trim();
      const button = [...document.querySelectorAll("button")]
        .find((candidate) => normalize(candidate.textContent ?? "").includes(${JSON.stringify(text)}));
      if (!button) throw new Error("Missing button: " + ${JSON.stringify(text)});
      button.click();
      return true;
    })()`,
  );
  await delay(180);
}

async function switchSystem(client, system) {
  await evaluate(
    client,
    `(() => {
      const normalize = (value) => value.replace(/\\s+/g, " ").trim();
      const button = [...document.querySelectorAll("button")]
        .find((candidate) => normalize(candidate.textContent ?? "").startsWith(${JSON.stringify(system)}));
      if (!button) throw new Error("Missing unit-system button: " + ${JSON.stringify(system)});
      if (button.getAttribute("aria-pressed") !== "true") button.click();
      return true;
    })()`,
  );
  await delay(220);
}

async function resetToImperial(client) {
  await switchSystem(client, "Imperial");
  await clickButton(client, "Reset");
}

async function changeProductDefinition(client, labelText) {
  return evaluate(
    client,
    `(() => {
      const normalize = (value) => value.replace(/\\s+/g, " ").trim();
      const label = [...document.querySelectorAll("label")]
        .find((candidate) => normalize(candidate.textContent ?? "").startsWith(${JSON.stringify(labelText)}));
      if (!label) throw new Error("Missing product definition field: " + ${JSON.stringify(labelText)});
      const control = label.querySelector("select, input");
      if (!control) throw new Error("Missing product definition control: " + ${JSON.stringify(labelText)});

      if (control instanceof HTMLSelectElement) {
        const alternative = [...control.options].find((option) => option.value !== control.value);
        if (!alternative) throw new Error("No alternative product option available.");
        const previous = control.value;
        const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set;
        setter.call(control, alternative.value);
        control.dispatchEvent(new Event("change", { bubbles: true }));
        return { previous, next: alternative.value, kind: "select" };
      }

      if (control instanceof HTMLInputElement) {
        const previous = control.value;
        const numeric = Number(previous);
        const next = Number.isFinite(numeric) && numeric > 0
          ? String(numeric + Math.max(1, numeric * 0.1))
          : "2";
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        setter.call(control, next);
        control.dispatchEvent(new Event("input", { bubbles: true }));
        control.dispatchEvent(new Event("change", { bubbles: true }));
        return { previous, next, kind: "input" };
      }

      throw new Error("Unsupported product control.");
    })()`,
  ).then(async (result) => {
    await delay(220);
    return result;
  });
}

async function costState(client) {
  return evaluate(
    client,
    `(() => {
      const price = document.querySelector('input[aria-label^="Price per "]');
      const currency = document.querySelector('input[placeholder="$' + ', EUR, EGP"]');
      const summary = [...document.querySelectorAll(".surface-summary")]
        .find((element) => (element.textContent ?? "").includes("Estimated material cost"));
      const error = document.querySelector('[id$="-cost-error"][role="alert"]');
      const primary = document.querySelector(".primary-result");
      return {
        priceValue: price?.value ?? null,
        priceLabel: price?.getAttribute("aria-label") ?? null,
        currencyValue: currency?.value ?? null,
        summaryText: summary?.textContent?.replace(/\\s+/g, " ").trim() ?? null,
        totalText: summary?.querySelectorAll("strong")?.[0]?.textContent?.trim() ?? null,
        basedText: summary?.querySelectorAll("strong")?.[1]?.textContent?.replace(/\\s+/g, " ").trim() ?? null,
        errorText: error?.textContent?.replace(/\\s+/g, " ").trim() ?? null,
        primaryText: primary?.textContent?.replace(/\\s+/g, " ").trim() ?? null,
      };
    })()`,
  );
}

async function setValidCost(client, currency = "EGP", price = "10") {
  await setInput(client, 'input[placeholder="$' + ', EUR, EGP"]', currency);
  await setInput(client, 'input[aria-label^="Price per "]', price);
  return costState(client);
}

function parseCostMath(state) {
  assert.ok(state.totalText, "expected cost total text");
  assert.ok(state.basedText, "expected cost basis text");
  const quantityMatch = state.basedText.replaceAll(",", "").match(/^(\d+)\s*×/);
  assert.ok(quantityMatch, `unable to parse purchase quantity from: ${state.basedText}`);
  const quantity = Number(quantityMatch[1]);
  const total = Number(state.totalText.replace(/^EGP\s*/, "").replaceAll(",", ""));
  assert.ok(Number.isFinite(total), `unable to parse total from: ${state.totalText}`);
  assert.equal(total, quantity * 10, "displayed cost must equal rounded purchase quantity × unit price");
  return { quantity, total };
}

async function assertKeyboardOrder(client) {
  await evaluate(
    client,
    `(() => {
      const price = document.querySelector('input[aria-label^="Price per "]');
      if (!price) throw new Error("Missing price input for keyboard test.");
      price.focus();
      return true;
    })()`,
  );
  await client.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
  });
  await client.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
  });
  await delay(100);
  const active = await evaluate(
    client,
    `(() => ({
      placeholder: document.activeElement?.getAttribute?.("placeholder") ?? null,
      tag: document.activeElement?.tagName ?? null,
    }))()`,
  );
  assert.equal(active.placeholder, "$ , EUR, EGP".replace("$ ", "$"), "Tab from price should focus currency label");
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

async function assertNoHorizontalOverflow(client, expectedWidth) {
  const dimensions = await evaluate(
    client,
    `(() => ({
      innerWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      priceRight: document.querySelector('input[aria-label^="Price per "]')?.getBoundingClientRect().right ?? null,
      currencyRight: document.querySelector('input[placeholder="$' + ', EUR, EGP"]')?.getBoundingClientRect().right ?? null,
    }))()`,
  );
  assert.equal(dimensions.innerWidth, expectedWidth);
  assert.ok(dimensions.documentWidth <= expectedWidth, `document overflow: ${JSON.stringify(dimensions)}`);
  assert.ok(dimensions.bodyWidth <= expectedWidth, `body overflow: ${JSON.stringify(dimensions)}`);
  return dimensions;
}

async function screenshot(client, selector, path) {
  await evaluate(
    client,
    `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) throw new Error("Missing screenshot target: " + ${JSON.stringify(selector)});
      element.scrollIntoView({ block: "center", inline: "nearest" });
      return true;
    })()`,
  );
  await delay(100);
  const capture = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  await writeFile(path, capture.data, "base64");
}

async function runRoute(client, config, browserErrors) {
  const startErrorIndex = browserErrors.length;
  await navigate(client, config.path);
  await setViewport(client, 1280);

  const initial = await costState(client);
  assert.ok(initial.priceLabel?.startsWith("Price per "), "price field must have an explicit accessible label");
  assert.equal(initial.priceValue, "", "unit price must be optional and blank by default");
  assert.equal(initial.currencyValue, "$", "default currency label should be $ without implying conversion");
  assert.equal(initial.summaryText, null, "blank unit price must not show a cost total");
  assert.ok(initial.primaryText, "material quantity result must remain visible");

  const valid = await setValidCost(client);
  assert.ok(valid.summaryText?.includes("Estimated material cost"));
  assert.ok(valid.summaryText?.includes("EGP"));
  assert.equal(valid.primaryText, initial.primaryText, "adding a price must not change the material result");
  const math = parseCostMath(valid);

  for (const currency of ["$", "EUR", "EGP"]) {
    const state = await setValidCost(client, currency, "10");
    assert.ok(state.totalText?.startsWith(`${currency} `), `expected ${currency} display label`);
  }

  await setInput(client, 'input[aria-label^="Price per "]', "0");
  let state = await costState(client);
  assert.ok(state.totalText?.includes("0.00"), "explicit zero price should produce a zero cost");

  await setInput(client, 'input[aria-label^="Price per "]', "-1");
  state = await costState(client);
  assert.ok(state.errorText?.includes("zero or greater"), "negative price should show a cost-only error");
  assert.ok(state.primaryText, "cost error must not hide valid quantity result");

  await setInput(client, 'input[aria-label^="Price per "]', "10");
  await setInput(client, 'input[placeholder="$' + ', EUR, EGP"]', "");
  state = await costState(client);
  assert.ok(state.errorText?.includes("currency label"), "blank currency label should be rejected when price is supplied");

  await setInput(client, 'input[placeholder="$' + ', EUR, EGP"]', "ABCDEFGHIJKLM");
  state = await costState(client);
  assert.ok(state.errorText?.includes("12 characters or fewer"), "overlong currency label should be rejected");

  await setInput(client, 'input[placeholder="$' + ', EUR, EGP"]', "EGP");
  await setInput(client, 'input[aria-label^="Price per "]', "9000000000000000");
  state = await costState(client);
  assert.ok(state.errorText?.includes("safe numeric range"), "unsafe total should be rejected");
  assert.ok(state.primaryText, "unsafe cost input must not affect material result");

  const nonFiniteActual = await setInput(client, 'input[aria-label^="Price per "]', "1e309");
  state = await costState(client);
  const nonFiniteBrowserCheck = nonFiniteActual
    ? state.errorText?.includes("finite") || state.errorText?.includes("safe numeric range")
    : "browser-sanitized-empty";
  if (nonFiniteActual) assert.ok(nonFiniteBrowserCheck, "non-finite browser price should be rejected");

  await resetToImperial(client);
  await setValidCost(client);
  await clickButton(client, "Copy");
  const copied = await evaluate(client, "window.__copiedText ?? ''");
  assert.ok(copied.includes("Estimated material cost: EGP "), "Copy should include a valid cost estimate");

  await clickButton(client, "Save");
  const historyWithCost = await evaluate(
    client,
    `document.querySelector(".history-panel")?.textContent?.replace(/\\s+/g, " ").trim() ?? ""`,
  );
  assert.ok(historyWithCost.includes("Est. cost EGP "), "device-local Save should include valid cost");

  await evaluate(client, "window.__printCalled = false");
  await clickButton(client, "Print");
  assert.equal(await evaluate(client, "window.__printCalled === true"), true, "Print should remain wired with cost");

  await navigate(client, config.path);
  await setViewport(client, 1280);
  await clickButton(client, "Copy");
  const copiedWithoutCost = await evaluate(client, "window.__copiedText ?? ''");
  assert.ok(!copiedWithoutCost.includes("Estimated material cost"), "blank-price Copy must remain quantity-only");
  await clickButton(client, "Save");
  const historyWithoutCost = await evaluate(
    client,
    `document.querySelector(".history-panel")?.textContent?.replace(/\\s+/g, " ").trim() ?? ""`,
  );
  assert.ok(!historyWithoutCost.includes("Est. cost"), "blank-price Save must remain quantity-only");
  await evaluate(client, "window.__printCalled = false");
  await clickButton(client, "Print");
  assert.equal(await evaluate(client, "window.__printCalled === true"), true, "Print should remain wired without cost");

  await assertKeyboardOrder(client);

  await setValidCost(client);
  const productChange = await changeProductDefinition(client, config.productLabel);
  state = await costState(client);
  assert.equal(state.priceValue, "", `${config.productLabel} change must clear stale unit price`);

  await navigate(client, config.path);
  await setViewport(client, 1280);
  await setValidCost(client);
  await switchSystem(client, "Metric");
  state = await costState(client);
  if (config.metricPriceBehavior === "clear") {
    assert.equal(state.priceValue, "", "unit switch must clear price when purchase package changes");
  } else {
    assert.equal(state.priceValue, "10", "unit switch must preserve price for the same physical package");
  }

  await switchSystem(client, "Imperial");
  await clickButton(client, "Reset");
  await setValidCost(client);

  const responsive = {};
  for (const width of [360, 768, 1280]) {
    await setViewport(client, width, width === 360 ? 800 : 900);
    responsive[width] = await assertNoHorizontalOverflow(client, width);
    if (width === 360) {
      await screenshot(
        client,
        'input[aria-label^="Price per "]',
        `${screenshotRoot}/${config.slug}-360-fields.png`,
      );
      await screenshot(
        client,
        ".surface-summary",
        `${screenshotRoot}/${config.slug}-360-result.png`,
      );
    }
    if (width === 1280) {
      await screenshot(
        client,
        ".calculator-workspace",
        `${screenshotRoot}/${config.slug}-1280-workspace.png`,
      );
    }
  }

  const routeErrors = browserErrors.slice(startErrorIndex);
  assert.equal(routeErrors.length, 0, `browser console/runtime errors: ${JSON.stringify(routeErrors)}`);

  return {
    path: config.path,
    purchaseUnit: valid.priceLabel?.replace(/^Price per /, ""),
    defaultPurchaseQuantity: math.quantity,
    checkedTotalAtTen: math.total,
    productChange,
    metricPriceBehavior: config.metricPriceBehavior,
    nonFiniteBrowserCheck,
    responsive,
    browserErrors: routeErrors,
    status: "passed",
  };
}

await mkdir(screenshotRoot, { recursive: true });

const chromePath = chromeExecutable();
console.log(`Using Chrome: ${chromePath}`);
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "about:blank",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);

let chromeStderr = "";
chrome.stderr.on("data", (chunk) => {
  chromeStderr += chunk.toString();
});

const report = {
  chrome: chromePath,
  generatedAt: new Date().toISOString(),
  routes: [],
  failures: [],
};

try {
  await waitForDebuggingEndpoint();
  const client = await createClient();
  const browserErrors = [];

  client.onEvent = (method, params) => {
    if (method === "Runtime.exceptionThrown") {
      browserErrors.push({
        type: "exception",
        text: params.exceptionDetails?.exception?.description ?? params.exceptionDetails?.text ?? "unknown",
      });
    }
    if (method === "Runtime.consoleAPICalled" && params.type === "error") {
      browserErrors.push({
        type: "console-error",
        text: (params.args ?? []).map((arg) => arg.value ?? arg.description ?? "").join(" "),
      });
    }
  };

  await client.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      try { localStorage.clear(); } catch {}
      window.__copiedText = "";
      window.__printCalled = false;
      try {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text) => { window.__copiedText = String(text); },
            readText: async () => window.__copiedText,
          },
        });
      } catch {}
      window.print = () => { window.__printCalled = true; };
    `,
  });

  for (const config of routes) {
    try {
      console.log(`Browser QA: ${config.path}`);
      const result = await runRoute(client, config, browserErrors);
      report.routes.push(result);
      console.log(`PASS ${config.path}: ${JSON.stringify(result)}`);
    } catch (error) {
      const failure = {
        path: config.path,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      };
      report.failures.push(failure);
      report.routes.push({ path: config.path, status: "failed", ...failure });
      console.error(`FAIL ${config.path}:`, error);
    }
  }

  client.close();
} finally {
  chrome.kill("SIGTERM");
  await writeFile(`${artifactRoot}/browser-qa.json`, `${JSON.stringify(report, null, 2)}\n`);
  if (chromeStderr) {
    await writeFile(`${artifactRoot}/chrome-stderr.log`, chromeStderr);
  }
}

if (report.failures.length > 0) {
  throw new Error(`${report.failures.length} browser QA route(s) failed.`);
}

console.log(`Supervised browser QA passed for ${report.routes.length} calculators.`);
