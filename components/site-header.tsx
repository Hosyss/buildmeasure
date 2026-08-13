type SiteHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export function SiteHeader({
  ctaHref = "/#calculators",
  ctaLabel = "Browse calculators",
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="shell utility-inner">
          <span>Free construction calculators</span>
          <span className="utility-separator" aria-hidden="true" />
          <span>Metric &amp; Imperial</span>
        </div>
      </div>
      <div className="shell nav-wrap">
        <a className="brand" href="/" aria-label="BuildMeasure home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>BuildMeasure</span>
        </a>
        <nav className="main-nav" aria-label="Primary navigation">
          <a href="/#calculators">Calculators</a>
          <a href="/guides/material-estimating-basics">Estimating guide</a>
          <a href="/methodology">Methodology</a>
        </nav>
        <a className="button button-small button-outline" href={ctaHref}>
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}
