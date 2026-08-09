const siteOrigin = "https://buildmeasure.hosy-sthdr.workers.dev";
const indexNowKey = "bb6fa46f3784f7f264c8d9ed4a9cc44c";
const indexNowEndpoint = "https://api.indexnow.org/indexnow";
const keyLocation = `${siteOrigin}/${indexNowKey}.txt`;

const sitemapResponse = await fetch(`${siteOrigin}/sitemap.xml`, {
  headers: { "user-agent": "BuildMeasure-IndexNow/1.0" },
});

if (!sitemapResponse.ok) {
  throw new Error(
    `Unable to read the production sitemap: HTTP ${sitemapResponse.status}`,
  );
}

const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);

if (urlList.length === 0) {
  throw new Error("The production sitemap did not contain any URLs.");
}

const expectedOrigin = new URL(siteOrigin).origin;
for (const value of urlList) {
  const url = new URL(value);
  if (url.origin !== expectedOrigin) {
    throw new Error(`Refusing to submit an off-site URL: ${value}`);
  }
}

const payload = {
  host: new URL(siteOrigin).host,
  key: indexNowKey,
  keyLocation,
  urlList,
};

if (process.argv.includes("--dry-run")) {
  console.log(
    `IndexNow dry run passed for ${urlList.length} BuildMeasure URLs.`,
  );
  process.exit(0);
}

const response = await fetch(indexNowEndpoint, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

if (response.status !== 200 && response.status !== 202) {
  const detail = (await response.text()).slice(0, 500);
  throw new Error(
    `IndexNow submission failed: HTTP ${response.status}${detail ? ` — ${detail}` : ""}`,
  );
}

console.log(
  `IndexNow accepted ${urlList.length} BuildMeasure URLs with HTTP ${response.status}.`,
);
