import { AnalyticsChoicesButton } from "@/components/clarity-consent";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <a className="brand brand-footer" href="/">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>BuildMeasure</span>
          </a>
          <p>Clear calculations for better-built projects.</p>
        </div>
        <div className="footer-links">
          <strong>Calculators</strong>
          <a href="/concrete-calculator">Concrete</a>
          <a href="/post-hole-concrete-calculator">Post holes</a>
          <a href="/paint-calculator">Paint</a>
          <a href="/tile-calculator">Tile</a>
          <a href="/brick-calculator">Brick</a>
          <a href="/gravel-calculator">Gravel</a>
          <a href="/mulch-calculator">Mulch</a>
          <a href="/drywall-calculator">Drywall</a>
        </div>
        <div className="footer-links">
          <strong>Product</strong>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/methodology">Methodology</a>
          <a href="/guides">Guide library</a>
          <a href="/guides/material-estimating-basics">Estimating guide</a>
          <a href="https://github.com/Hosyss/buildmeasure">Source & releases</a>
          <a href="/feedback">Report an issue</a>
          <a href="/status">System status</a>
          <a href="/privacy">Privacy</a>
          <AnalyticsChoicesButton />
          <a href="/terms">Terms</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 BuildMeasure · Independently maintained by Hosyss</span>
        <span>Estimates should be verified against project plans and supplier data.</span>
      </div>
    </footer>
  );
}
