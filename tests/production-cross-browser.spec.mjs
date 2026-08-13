import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/concrete-calculator",
  "/post-hole-concrete-calculator",
  "/paint-calculator",
  "/tile-calculator",
  "/brick-calculator",
  "/gravel-calculator",
  "/mulch-calculator",
  "/guides/how-many-bags-of-concrete",
  "/guides/how-many-bags-of-concrete-for-post-holes",
  "/guides/how-much-paint-do-i-need",
  "/guides/how-many-tiles-do-i-need",
  "/guides/how-many-bricks-do-i-need",
  "/guides/how-much-gravel-do-i-need",
  "/guides/how-much-mulch-do-i-need",
];

const surfaces = [
  ["/", "home"],
  ["/brick-calculator", "brick"],
  ["/guides/how-many-bricks-do-i-need", "brick-guide"],
];

const viewports = [
  { width: 360, height: 900, name: "360" },
  { width: 768, height: 1024, name: "768" },
  { width: 1280, height: 900, name: "1280" },
];

function observePage(page) {
  const pageErrors = [];
  const failedRequests = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("requestfailed", (request) => {
    const url = new URL(request.url());
    if (
      url.origin === "https://buildmeasure.buildtools.workers.dev" &&
      url.pathname !== "/api/analytics"
    ) {
      failedRequests.push(`${request.method()} ${url.pathname}: ${request.failure()?.errorText ?? "failed"}`);
    }
  });
  return { pageErrors, failedRequests };
}

test("public HTTP surfaces are healthy", async ({ request }) => {
  for (const path of ["/api/health", "/robots.txt", "/sitemap.xml", "/llms.txt"]) {
    const response = await request.get(path);
    expect(response.status(), `${path} HTTP status`).toBe(200);
    expect((await response.text()).length, `${path} response body`).toBeGreaterThan(10);
  }
});

for (const viewport of viewports) {
  test(`all routes render without overflow or runtime errors at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const evidence = observePage(page);

    for (const path of routes) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${path} HTTP status`).toBe(200);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("h1")).toBeVisible();

      const overflow = await page.evaluate(() =>
        Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
        document.documentElement.clientWidth
      );
      expect(overflow, `${path} horizontal overflow`).toBeLessThanOrEqual(1);
    }

    expect(evidence.pageErrors, "uncaught page errors").toEqual([]);
    expect(evidence.failedRequests, "failed same-origin requests").toEqual([]);
  });

  test(`critical interaction and visual evidence at ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const evidence = observePage(page);

    for (const [path, label] of surfaces) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath(`${testInfo.project.name}-${viewport.name}-${label}.png`),
        fullPage: true,
      });
    }

    await page.goto("/brick-calculator", { waitUntil: "domcontentloaded" });
    const metric = page.getByRole("button", { name: /Metric/ });
    await expect(metric).toBeVisible();
    await metric.click();
    await expect(page.getByText("972", { exact: true })).toBeVisible();
    await expect(page.getByText("49 bricks", { exact: true })).toBeVisible();
    await expect(page.getByText("1,021 bricks", { exact: true })).toBeVisible();

    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const element = document.activeElement;
      return Boolean(element && element !== document.body && element.matches("a,button,input,select,textarea,[tabindex]"));
    });
    expect(focused, "keyboard focus reaches an interactive element").toBe(true);

    expect(evidence.pageErrors, "uncaught page errors").toEqual([]);
    expect(evidence.failedRequests, "failed same-origin requests").toEqual([]);
  });
}
