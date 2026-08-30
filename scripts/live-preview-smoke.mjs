const token = process.env.GITHUB_TOKEN?.trim();
const repository = process.env.GITHUB_REPOSITORY?.trim();
const previewSha = process.env.PREVIEW_SHA?.trim();
const waitMs = Number.parseInt(process.env.PREVIEW_WAIT_MS ?? "420000", 10);

if (!token || !repository || !previewSha) {
  throw new Error("GITHUB_TOKEN, GITHUB_REPOSITORY, and PREVIEW_SHA are required.");
}

if (!Number.isFinite(waitMs) || waitMs < 30_000 || waitMs > 900_000) {
  throw new Error("PREVIEW_WAIT_MS must be between 30000 and 900000 milliseconds.");
}

const calculatorRoutes = [
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
];

const pageRoutes = [
  "/",
  "/calculators",
  ...calculatorRoutes,
  "/guides",
  "/projects",
  "/methodology",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/editorial-policy",
];

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithTimeout(url, init = {}, timeoutMs = 20_000) {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "user-agent": "BuildNumbers-exact-preview-smoke/1.0",
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
      console.log("Waiting for the exact-head Cloudflare Pages check...");
      await sleep(10_000);
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

async function fetchLive(url, label, attempts = 4) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, { redirect: "manual" });
      if (response.status === 200) {
        return response;
      }
      lastError = new Error(`${label} returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      await sleep(3_000 * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${label} failed.`);
}

function collectFirstPartyAssets(html, baseUrl, assets) {
  const attributePattern = /(?:src|href)=["']([^"'#]+)["']/gi;
  for (const match of html.matchAll(attributePattern)) {
    try {
      const url = new URL(match[1], baseUrl);
      if (url.origin !== baseUrl.origin) continue;
      if (
        url.pathname.startsWith("/_next/") ||
        url.pathname.startsWith("/assets/") ||
        /\.(?:css|js|mjs|woff2?|png|jpe?g|svg|webp)$/i.test(url.pathname)
      ) {
        assets.add(url.href);
      }
    } catch {
      // Ignore malformed non-navigation attributes; route tests cover real links separately.
    }
  }
}

const previewUrl = await findExactPreviewUrl();
const previewBase = new URL(previewUrl);
console.log(`Exact-head Preview: ${previewUrl}`);

const assets = new Set();
for (const route of pageRoutes) {
  const url = new URL(route, previewBase);
  const response = await fetchLive(url, `Route ${route}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("text/html")) {
    throw new Error(`Route ${route} returned unexpected content type: ${contentType || "missing"}.`);
  }

  const html = await response.text();
  if (html.length < 200) {
    throw new Error(`Route ${route} returned an unexpectedly small HTML document.`);
  }
  if (route === "/" && !html.includes("BuildNumbers")) {
    throw new Error("Homepage live HTML does not contain the BuildNumbers product marker.");
  }
  collectFirstPartyAssets(html, previewBase, assets);
  console.log(`PASS ${route}`);
}

const healthResponse = await fetchLive(new URL("/api/health", previewBase), "Health endpoint");
const health = await healthResponse.json();
if (
  health?.status !== "ok" ||
  health?.checks?.feedbackStorage !== "ok" ||
  health?.checks?.analyticsStorage !== "ok"
) {
  throw new Error(`Preview health is not fully ready: ${JSON.stringify(health)}`);
}
console.log("PASS /api/health");

for (const assetUrl of assets) {
  const response = await fetchLive(assetUrl, `Asset ${new URL(assetUrl).pathname}`);
  await response.arrayBuffer();
}
console.log(`PASS ${assets.size} first-party CSS/JS/font/image assets referenced by live HTML`);

console.log(
  `Exact-preview smoke passed: ${pageRoutes.length} HTML routes, /api/health, ${calculatorRoutes.length} calculators, and ${assets.size} referenced assets.`,
);
