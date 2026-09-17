import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />
      <main>
        <section className="utility-page-hero utility-page-hero-compact">
          <div className="shell">
            <p className="eyebrow">404 — Page not found</p>
            <h1>That page is not available.</h1>
            <p>
              The address may be outdated or mistyped. Use the BuildMeasure
              calculator list or guide library to continue with a material estimate.
            </p>
            <div className="utility-link-row">
              <a className="button button-primary" href="/#calculators">
                Browse calculators
              </a>
              <a className="button button-quiet" href="/guides">
                Open the guide library
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
