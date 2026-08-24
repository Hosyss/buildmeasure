# BuildMeasure AdSense readiness gate

Last reviewed: 2026-08-22

This document is the release gate for submitting BuildMeasure to Google AdSense and for enabling ads after approval.

## Current readiness

- The public site has eight substantive calculators, eight focused estimating guides, a guide library, an estimating workflow, methodology, About, Privacy, Terms, and Contact pages.
- Public content pages use canonical URLs and the high-value public routes are listed in `sitemap.xml`.
- Utility/private routes remain outside the sitemap. `/projects` and `/feedback` are `noindex`; `/status`, `/analytics`, and owner-only surfaces are also excluded from search.
- `robots.txt` allows normal crawlers to reach public content and does not block the AdSense crawler from the site as a whole.
- The AdSense account verification meta tag and root `ads.txt` declaration are present and use the same publisher account.
- No AdSense ad script or ad units are enabled during the review-preparation stage.
- Privacy copy explains first-party analytics, optional Microsoft Clarity, planned Google advertising, cookies/identifiers, and consent requirements.

## Blocking check before requesting review

Do **not** request the final AdSense review until the submitted site URL is accepted by AdSense and matches the canonical production host.

The current production host is `buildmeasure.buildtools.workers.dev`. Google normally asks for a standard domain and does not accept ordinary nested subdomains as separate sites. `workers.dev` is a Public Suffix List platform, but BuildMeasure is one level below the account-level `buildtools.workers.dev` name. Before submission, either:

1. confirm in the AdSense Sites UI that the exact current BuildMeasure host is accepted as the site being reviewed, or
2. move BuildMeasure to a registrable custom domain and update `SITE_URL`, canonicals, sitemap, structured data, redirects, and verification tests before requesting review.

Do not change canonicals to a domain that is not already live and serving the same content.

## Review-time checks

Before clicking **Request review**:

1. Production homepage, all eight calculators, the guide library, all eight focused guides, About, Methodology, Contact, Privacy, and Terms return HTTP 200 without authentication.
2. `robots.txt`, `sitemap.xml`, and `ads.txt` return HTTP 200 from the exact submitted host.
3. The AdSense verification meta tag is present in the `<head>` of public pages.
4. There are no broken internal links, placeholder sections, "coming soon" cards presented as live content, or empty public pages.
5. Mobile layouts at 360 px and tablet/desktop layouts have no horizontal overflow or obscured primary content.
6. About, Contact, Privacy, and Terms remain reachable from the site footer.
7. Search/indexing remains focused on substantive public content; utility and owner pages stay out of the sitemap.
8. The site remains usable without signing in.

## Consent and privacy before ads serve

If AdSense is approved and ads are enabled:

- Configure a Google-certified consent management platform for traffic where Google requires it, including EEA, UK, and Switzerland requirements.
- Keep Microsoft Clarity consent separate from advertising consent unless the chosen CMP and privacy implementation intentionally combine them.
- Do not pass calculator measurements, saved project names, entered prices, calculated costs, feedback text, or other user-entered project data to AdSense as custom targeting data.
- Recheck the Privacy Policy after the final CMP/ad configuration is known.

## Initial ad-placement boundary

Start ads only on substantive public content pages. Do not place ads initially on `/projects`, `/feedback`, `/status`, `/analytics`, `/feedback/inbox`, API routes, error pages, or other utility/private screens. This keeps ads away from low-content, behavioral, or owner-only surfaces.

Ad density must never obscure calculator inputs/results, navigation, references, worked examples, or guide content. Avoid placements that can be confused with calculator controls or primary action buttons.

## Post-approval verification

After ads are enabled:

- verify the CMP before personalized advertising for applicable regions;
- verify `ads.txt` is reachable from the approved site root;
- verify no console/page errors are introduced by ad code;
- verify calculator input latency and layout stability remain acceptable on mobile;
- rerun the normal BuildMeasure quality gate and responsive browser QA;
- inspect real production pages rather than relying only on local build output.
