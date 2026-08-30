# Traffic and search operations

BuildNumbers is technically crawlable, but crawlability does not guarantee
rankings or visitors. Search growth requires useful query-targeted pages,
indexing, external discovery, and enough time for search engines to evaluate
the site.

## What counts as a real visit

The owner analytics dashboard counts an engaged session only after a page has
remained visible for at least eight seconds and receives a pointer, keyboard,
or scroll interaction, or after a calculator is used. Raw requests, uptime
checks, Lighthouse, Observatory, and passive crawlers do not count as engaged
sessions.

## Weekly free-plan routine

1. Check Google Search Console for indexed pages, impressions, queries,
   click-through rate, and crawl errors.
2. Check the owner analytics page for engaged landing pages, sources,
   completed calculations, invalid attempts, feedback, and client errors.
3. Fix confirmed product or indexing defects before publishing more content.
4. Publish at most one genuinely useful page around a calculator question;
   avoid thin location pages, copied text, and mass-generated variations.
5. Share the most relevant calculator or guide in communities where the answer
   is useful and permitted. Do not spam or buy links.
6. Record every promotion with UTM values so engaged sources are measurable.

Suggested format:

```text
?utm_source=<community>&utm_medium=referral&utm_campaign=first_users
```

## Decision rules

- Impressions but few clicks: improve the title and search description to
  match the query intent.
- Clicks but no engagement: inspect mobile usability, speed, clarity, and the
  first screen.
- Engagement but few completed calculations: inspect inputs, defaults, errors,
  and result explanation.
- Repeated calculation failures or feedback: add a regression test, fix the
  defect, and document the release.
- No impressions after several weeks: confirm indexing and strengthen internal
  and external discovery before adding more pages.

Never promise a traffic number or ranking date. Measure the trend using Search
Console and privacy-conscious engagement evidence.
