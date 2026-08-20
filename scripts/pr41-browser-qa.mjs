import assert from "node:assert/strict";
import { firefox, webkit } from "playwright";

const baseUrl = process.env.BROWSER_QA_BASE_URL ?? "http://127.0.0.1:4173";
const viewports = [
  { width: 360, height: 800 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
];
const engines = [
  ["firefox", firefox],
  ["webkit", webkit],
];

function within(value, minimum, maximum, label) {
  assert.ok(value >= minimum && value <= maximum, `${label}: ${value} not in [${minimum}, ${maximum}]`);
}

for (const [engineName, browserType] of engines) {
  const browser = await browserType.launch();
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      let clarityRequests = 0;

      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(String(error)));
      page.on("request", (request) => {
        if (new URL(request.url()).hostname.endsWith("clarity.ms")) clarityRequests += 1;
      });
      await page.route("https://www.clarity.ms/**", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
      });

      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      const panel = page.locator('section[aria-label="Analytics choices"]');
      await panel.waitFor({ state: "visible" });

      assert.equal(clarityRequests, 0, "Clarity requested before consent");
      assert.equal(await page.locator("#buildmeasure-clarity").count(), 0, "Clarity script exists before consent");

      const viewportState = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      assert.ok(
        viewportState.scrollWidth <= viewportState.innerWidth + 1,
        `horizontal overflow: ${viewportState.scrollWidth} > ${viewportState.innerWidth}`,
      );

      const panelBox = await panel.boundingBox();
      assert.ok(panelBox, "Consent panel has no bounding box");
      within(panelBox.x, 0, viewport.width, "panel x");
      within(panelBox.y, 0, viewport.height, "panel y");
      assert.ok(panelBox.x + panelBox.width <= viewport.width + 1, "Consent panel is clipped horizontally");
      assert.ok(panelBox.y + panelBox.height <= viewport.height + 1, "Consent panel is clipped vertically");

      for (const [role, name] of [
        ["button", "Allow analytics"],
        ["button", "Decline analytics"],
        ["link", "Privacy policy"],
      ]) {
        const target = page.getByRole(role, { name });
        const box = await target.boundingBox();
        assert.ok(box, `${name} has no bounding box`);
        assert.ok(box.height >= 44, `${name} target is ${box.height}px high`);
        assert.ok(box.x >= 0 && box.x + box.width <= viewport.width + 1, `${name} clipped horizontally`);
        assert.ok(box.y >= 0 && box.y + box.height <= viewport.height + 1, `${name} clipped vertically`);
      }

      assert.equal(await page.getByRole("link", { name: "Privacy policy" }).getAttribute("href"), "/privacy");

      await page.getByRole("button", { name: "Decline analytics" }).click();
      await panel.waitFor({ state: "hidden" });
      assert.equal(await page.evaluate(() => localStorage.getItem("buildmeasure-analytics-consent-v1")), "denied");
      assert.equal(clarityRequests, 0, "Decline triggered a Clarity request");

      await page.getByRole("button", { name: "Analytics choices" }).click();
      await panel.waitFor({ state: "visible" });
      assert.equal(clarityRequests, 0, "Reopening choices triggered a Clarity request");

      await page.getByRole("button", { name: "Allow analytics" }).click();
      await panel.waitFor({ state: "hidden" });
      assert.equal(await page.evaluate(() => localStorage.getItem("buildmeasure-analytics-consent-v1")), "granted");
      await page.locator("#buildmeasure-clarity").waitFor({ state: "attached" });
      assert.match(
        (await page.locator("#buildmeasure-clarity").getAttribute("src")) ?? "",
        /^https:\/\/www\.clarity\.ms\/tag\//,
      );
      assert.ok(clarityRequests >= 1, "Allow did not trigger a Clarity request");

      assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(" | ")}`);
      assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors.join(" | ")}`);

      console.log(`PASS ${engineName} ${viewport.width}x${viewport.height}`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

console.log("PASS 6/6 responsive consent browser checks");
