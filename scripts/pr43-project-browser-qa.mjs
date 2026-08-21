import assert from "node:assert/strict";
import { firefox, webkit } from "playwright";

const baseUrl = process.env.BROWSER_QA_BASE_URL ?? "http://127.0.0.1:3000";
const viewports = [
  { width: 360, height: 800 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
];
const browsers = [
  ["Firefox", firefox],
  ["WebKit", webkit],
];

const seededHistories = {
  "buildmeasure.concrete.history.v1": JSON.stringify([
    {
      id: 1001,
      label: "10 × 10 × 4 ft / in",
      summary: "1.36 yd³ · 62 × 80 lb bags",
    },
  ]),
  "buildmeasure.paint.history.v1": JSON.stringify([
    {
      id: 2001,
      label: "12 × 10 × 8 ft",
      summary: "2 × 1 gal · 1.6 gal",
    },
  ]),
};

function assertAtLeast44(box, label) {
  assert.ok(box, `${label} must have a bounding box`);
  assert.ok(box.height >= 44, `${label} must be at least 44px high; got ${box.height}`);
}

for (const [browserName, browserType] of browsers) {
  const browser = await browserType.launch({ headless: true });

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const pageErrors = [];
      const consoleErrors = [];

      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      await page.addInitScript(({ histories }) => {
        localStorage.clear();
        for (const [key, value] of Object.entries(histories)) {
          localStorage.setItem(key, value);
        }
        localStorage.setItem("buildmeasure-analytics-consent-v1", "denied");
      }, { histories: seededHistories });

      const response = await page.goto(`${baseUrl}/projects`, {
        waitUntil: "networkidle",
      });
      assert.equal(response?.status(), 200, `${browserName} ${viewport.width}: /projects must return 200`);

      const overflowBefore = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      assert.ok(
        overflowBefore.scrollWidth <= overflowBefore.clientWidth + 1,
        `${browserName} ${viewport.width}: horizontal overflow ${overflowBefore.scrollWidth} > ${overflowBefore.clientWidth}`,
      );

      const mask = page.locator('[data-clarity-mask="true"]');
      assert.equal(await mask.count(), 1, `${browserName} ${viewport.width}: Project Mode workspace must be Clarity-masked`);
      await assert.doesNotReject(() => page.getByText("Concrete", { exact: true }).first().waitFor());
      await assert.doesNotReject(() => page.getByText("Paint", { exact: true }).first().waitFor());
      await assert.doesNotReject(() => page.getByText("10 × 10 × 4 ft / in", { exact: true }).first().waitFor());
      await assert.doesNotReject(() => page.getByText("12 × 10 × 8 ft", { exact: true }).first().waitFor());

      const projectName = page.getByPlaceholder("Back patio, guest room, fence…");
      const saveProject = page.getByRole("button", { name: "Save project" });
      assert.equal(await saveProject.isDisabled(), true, `${browserName} ${viewport.width}: Save starts disabled`);

      await projectName.fill("Browser QA project");
      assert.equal(await saveProject.isDisabled(), true, `${browserName} ${viewport.width}: name alone must not enable Save`);

      const checkboxes = page.locator('input[type="checkbox"]');
      assert.equal(await checkboxes.count(), 2, `${browserName} ${viewport.width}: expected two seeded estimates`);
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      assert.equal(await saveProject.isDisabled(), false, `${browserName} ${viewport.width}: name + estimates enables Save`);

      assertAtLeast44(await projectName.boundingBox(), `${browserName} ${viewport.width} project-name input`);
      assertAtLeast44(await saveProject.boundingBox(), `${browserName} ${viewport.width} Save project`);

      await saveProject.click();
      await page.getByText("Project saved on this device.", { exact: true }).waitFor();
      const savedHeading = page.getByRole("heading", { name: "Browser QA project", exact: true });
      await savedHeading.waitFor();

      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("buildmeasure.projects.v1") ?? "[]"));
      assert.equal(stored.length, 1, `${browserName} ${viewport.width}: one project persisted`);
      assert.equal(stored[0].name, "Browser QA project");
      assert.equal(stored[0].items.length, 2);
      assert.deepEqual(
        stored[0].items.map((item) => item.calculator).sort(),
        ["concrete", "paint"],
      );
      for (const item of stored[0].items) {
        assert.deepEqual(
          Object.keys(item).sort(),
          ["calculator", "estimateId", "label", "summary"],
          `${browserName} ${viewport.width}: project item must contain only bounded snapshot fields`,
        );
      }

      const historiesAfterSave = await page.evaluate(() => ({
        concrete: localStorage.getItem("buildmeasure.concrete.history.v1"),
        paint: localStorage.getItem("buildmeasure.paint.history.v1"),
      }));
      assert.equal(historiesAfterSave.concrete, seededHistories["buildmeasure.concrete.history.v1"]);
      assert.equal(historiesAfterSave.paint, seededHistories["buildmeasure.paint.history.v1"]);

      const projectNameInsideMask = await savedHeading.evaluate((node) => Boolean(node.closest('[data-clarity-mask="true"]')));
      assert.equal(projectNameInsideMask, true, `${browserName} ${viewport.width}: saved project text must remain inside mask`);

      await page.reload({ waitUntil: "networkidle" });
      await page.getByRole("heading", { name: "Browser QA project", exact: true }).waitFor();
      const persistedAfterReload = await page.evaluate(() => JSON.parse(localStorage.getItem("buildmeasure.projects.v1") ?? "[]"));
      assert.equal(persistedAfterReload.length, 1, `${browserName} ${viewport.width}: project must survive reload`);

      const copyButton = page.getByRole("button", { name: "Copy project list" });
      const deleteButton = page.getByRole("button", { name: "Delete", exact: true });
      assertAtLeast44(await copyButton.boundingBox(), `${browserName} ${viewport.width} Copy project list`);
      assertAtLeast44(await deleteButton.boundingBox(), `${browserName} ${viewport.width} Delete`);

      await deleteButton.click();
      await page.getByText("No saved projects yet.", { exact: false }).waitFor();
      const projectsAfterDelete = await page.evaluate(() => JSON.parse(localStorage.getItem("buildmeasure.projects.v1") ?? "[]"));
      assert.deepEqual(projectsAfterDelete, [], `${browserName} ${viewport.width}: delete must remove project`);

      const overflowAfter = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      assert.ok(
        overflowAfter.scrollWidth <= overflowAfter.clientWidth + 1,
        `${browserName} ${viewport.width}: post-interaction horizontal overflow`,
      );

      assert.deepEqual(pageErrors, [], `${browserName} ${viewport.width}: page errors: ${pageErrors.join(" | ")}`);
      assert.deepEqual(consoleErrors, [], `${browserName} ${viewport.width}: console errors: ${consoleErrors.join(" | ")}`);

      console.log(`PASS ${browserName} ${viewport.width}x${viewport.height}`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

console.log("Project Mode browser QA passed 6/6.");
