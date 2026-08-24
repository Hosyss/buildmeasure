# Search-engine discovery

BuildMeasure uses two complementary, free discovery paths.

## Google

- The canonical production origin is
  `https://buildmeasuretools.pages.dev/`.
- Add and verify its URL-prefix property in Google Search Console, then submit
  `https://buildmeasuretools.pages.dev/sitemap.xml`.
- Keep the former verified property active during the migration window.
- Keep `sitemap.xml` submitted and inspect the indexing report weekly.
- Do not repeatedly request indexing for the same URL. A valid sitemap and an
  indexable response do not guarantee that Google will index or rank a page.

## IndexNow participants

The project hosts its IndexNow ownership key at the site root and includes a
bounded submission script for Bing and the other participating search engines.
The script reads the live sitemap, rejects off-site URLs, and submits at most
the URLs that the production sitemap exposes.

After a verified production deployment that adds, changes, or removes public
content, run:

```bash
npm run seo:indexnow
```

For a read-only validation of the live sitemap and URL allowlist, run:

```bash
npm run seo:indexnow -- --dry-run
```

An HTTP 200 or 202 response confirms receipt only. It does not guarantee crawl,
indexing, ranking, impressions, or visits. Avoid repeated submissions when no
public URL changed.
