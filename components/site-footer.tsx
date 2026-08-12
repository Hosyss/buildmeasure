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
          <a href="/paint-calculator">Paint</a>
          <a href="/tile-calculator">Tile</a>
          <a href="/gravel-calculator">Gravel</a>
          <a href="/mulch-calculator">Mulch</a>
        </div>
        <div className="footer-links">
          <strong>Product</strong>
          <a href="/about">About</a>
          <a href="/methodology">Methodology</a>
          <a href="/guides/material-estimating-basics">Estimating guide</a>
          <a href="/#project-mode">Project Mode</a>
          <a href="/feedback">Report an issue</a>
          <a href="/status">System status</a>
          <a href="/privacy">Privacy</a>
          <AnalyticsChoicesButton />
          <a href="/terms">Terms</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 BuildMeasure</span>
        <span>Estimates should be verified against project plans and supplier data.</span>
      </div>
    </footer>
  );
}
