import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4173";
const cdpOrigin = process.env.CDP_ORIGIN || "http://127.0.0.1:9222";
const outDir = process.env.QA_SCREENSHOT_DIR || "/tmp/ux-qa";
await mkdir(outDir, { recursive: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createTarget(url) {
  const response = await fetch(`${cdpOrigin}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT",
  });
  if (!response.ok) throw new Error(`CDP target creation failed: ${response.status}`);
  return response.json();
}

class CdpSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
        return;
      }
      this.events.push(message);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(`Runtime evaluation failed: ${JSON.stringify(result.exceptionDetails)}`);
    }
    return result.result.value;
  }

  close() {
    this.ws.close();
  }
}

async function waitForReady(session, expectedPath) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const ready = await session.evaluate(`(() => ({
      state: document.readyState,
      path: location.pathname,
      h1: document.querySelector('h1')?.textContent || ''
    }))()`);
    if (ready.state === "complete" && ready.path === expectedPath && ready.h1) {
      await delay(350);
      return;
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${expectedPath}`);
}

async function dismissConsent(session) {
  await session.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')]
      .find((item) => item.textContent?.trim() === 'No thanks');
    if (button) button.click();
    return Boolean(button);
  })()`);
  await delay(100);
}

function browserErrors(events) {
  return events
    .filter((event) =>
      event.method === "Runtime.exceptionThrown" ||
      (event.method === "Runtime.consoleAPICalled" && event.params?.type === "error") ||
      (event.method === "Log.entryAdded" && event.params?.entry?.level === "error"),
    )
    .map((event) => JSON.stringify(event));
}

async function openPage(path, width, height) {
  const target = await createTarget("about:blank");
  const session = new CdpSession(target.webSocketDebuggerUrl);
  await session.open();
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("Log.enable");
  await session.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 768,
  });
  await session.send("Page.navigate", { url: `${origin}${path}` });
  await waitForReady(session, path);
  await dismissConsent(session);
  return session;
}

async function assertNoOverflow(session, label) {
  const metrics = await session.evaluate(`(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth
  }))()`);
  assert.ok(
    metrics.scrollWidth <= metrics.viewport + 1 && metrics.bodyWidth <= metrics.viewport + 1,
    `${label} overflowed: ${JSON.stringify(metrics)}`,
  );
}

async function screenshot(session, name) {
  const { data } = await session.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(`${outDir}/${name}.png`, Buffer.from(data, "base64"));
}

const viewports = [
  { width: 360, height: 800 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
];

for (const { width, height } of viewports) {
  const home = await openPage("/", width, height);
  await assertNoOverflow(home, `home ${width}`);
  const homeState = await home.evaluate(`(() => {
    const card = document.querySelector('a.estimate-card-link');
    const headerCta = document.querySelector('.site-header .button-outline');
    return {
      cardHref: card?.getAttribute('href'),
      cardTitle: card?.querySelector('h2')?.textContent?.trim(),
      cardControls: card?.querySelectorAll('input, select, button').length ?? -1,
      headerText: headerCta?.textContent?.trim(),
      headerHref: headerCta?.getAttribute('href'),
    };
  })()`);
  assert.deepEqual(homeState, {
    cardHref: "/concrete-calculator",
    cardTitle: "Example estimate",
    cardControls: 0,
    headerText: "Browse calculators",
    headerHref: "/#calculators",
  });
  assert.deepEqual(browserErrors(home.events), [], `home ${width} console/runtime errors`);
  await screenshot(home, `home-${width}`);
  home.close();

  const brick = await openPage("/brick-calculator", width, height);
  await assertNoOverflow(brick, `brick ${width}`);
  const initial = await brick.evaluate(`(() => {
    const select = document.querySelector('.brick-workspace select');
    const output = document.querySelector('#brick-rate-output');
    const cta = document.querySelector('.site-header .button-outline');
    return {
      presetOptions: [...select.options].slice(0, -1).map((o) => o.textContent.trim()),
      output: output?.textContent?.replace(/\\s+/g, ' ').trim(),
      customInput: Boolean(document.querySelector('#brick-custom-coverage-rate')),
      ctaText: cta?.textContent?.trim(),
      ctaHref: cta?.getAttribute('href'),
    };
  })()`);
  assert.ok(initial.presetOptions.every((text) => text.includes("/ 100 ft²")), "Imperial preset labels must use 100 ft²");
  assert.match(initial.output || "", /675.*100 ft²/);
  assert.equal(initial.customInput, false);
  assert.equal(initial.ctaText, "All calculators");
  assert.equal(initial.ctaHref, "/#calculators");

  await brick.evaluate(`(() => {
    const buttons = [...document.querySelectorAll('.brick-workspace .unit-toggle button')];
    buttons.find((button) => button.textContent.includes('Metric'))?.click();
    return true;
  })()`);
  await delay(300);
  const metric = await brick.evaluate(`(() => {
    const select = document.querySelector('.brick-workspace select');
    return {
      presetOptions: [...select.options].slice(0, -1).map((o) => o.textContent.trim()),
      output: document.querySelector('#brick-rate-output')?.textContent?.replace(/\\s+/g, ' ').trim(),
    };
  })()`);
  assert.ok(metric.presetOptions.every((text) => text.includes("/ 10 m²") && !text.includes("100 ft²")), "Metric preset labels must use converted 10 m² values");
  assert.match(metric.output || "", /10 m²/);

  await brick.evaluate(`(() => {
    const select = document.querySelector('.brick-workspace select');
    select.value = 'custom';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await delay(250);
  const customMetric = await brick.evaluate(`(() => ({
    input: Boolean(document.querySelector('#brick-custom-coverage-rate')),
    output: Boolean(document.querySelector('#brick-rate-output')),
    unitText: document.querySelector('#brick-custom-coverage-rate')?.parentElement?.textContent?.replace(/\\s+/g, ' ').trim(),
  }))()`);
  assert.equal(customMetric.input, true, "Custom must expose a real input");
  assert.equal(customMetric.output, false, "Custom must replace the preset output");
  assert.match(customMetric.unitText || "", /10 m²/);

  await brick.evaluate(`(() => {
    const buttons = [...document.querySelectorAll('.brick-workspace .unit-toggle button')];
    buttons.find((button) => button.textContent.includes('Imperial'))?.click();
    return true;
  })()`);
  await delay(300);
  const customImperial = await brick.evaluate(`(() => ({
    input: Boolean(document.querySelector('#brick-custom-coverage-rate')),
    value: Number(document.querySelector('#brick-custom-coverage-rate')?.value),
    unitText: document.querySelector('#brick-custom-coverage-rate')?.parentElement?.textContent?.replace(/\\s+/g, ' ').trim(),
  }))()`);
  assert.equal(customImperial.input, true);
  assert.ok(Math.abs(customImperial.value - 675) < 0.001, `Custom round trip drifted: ${customImperial.value}`);
  assert.match(customImperial.unitText || "", /100 ft²/);

  await brick.evaluate(`(() => {
    const select = document.querySelector('.brick-workspace select');
    select.value = 'roman';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await delay(250);
  const presetAgain = await brick.evaluate(`(() => ({
    input: Boolean(document.querySelector('#brick-custom-coverage-rate')),
    output: document.querySelector('#brick-rate-output')?.textContent?.replace(/\\s+/g, ' ').trim(),
  }))()`);
  assert.equal(presetAgain.input, false);
  assert.match(presetAgain.output || "", /600.*100 ft²/);
  await assertNoOverflow(brick, `brick after interactions ${width}`);
  assert.deepEqual(browserErrors(brick.events), [], `brick ${width} console/runtime errors`);
  await screenshot(brick, `brick-${width}`);
  brick.close();

  const guide = await openPage("/guides/how-many-bricks-do-i-need", width, height);
  await assertNoOverflow(guide, `brick guide ${width}`);
  const guideState = await guide.evaluate(`(() => {
    const cta = document.querySelector('.site-header .button-outline');
    const quick = document.querySelector('#answer');
    const primary = document.querySelector('#answer .guide-primary-action');
    return {
      ctaText: cta?.textContent?.trim(),
      ctaHref: cta?.getAttribute('href'),
      quickTop: quick?.getBoundingClientRect().top,
      primaryTop: primary?.getBoundingClientRect().top,
      viewportHeight: window.innerHeight,
    };
  })()`);
  assert.equal(guideState.ctaText, "Open Brick Calculator");
  assert.equal(guideState.ctaHref, "/brick-calculator");
  if (width === 1280) {
    assert.ok(guideState.primaryTop < guideState.viewportHeight, `Desktop guide CTA should appear in first screen: ${JSON.stringify(guideState)}`);
  }
  assert.deepEqual(browserErrors(guide.events), [], `guide ${width} console/runtime errors`);
  await screenshot(guide, `brick-guide-${width}`);
  guide.close();
}

console.log("Browser QA passed: home, Brick Imperial/Metric/Custom, guide CTA, 360/768/1280, no overflow or console/runtime errors.");
