type SiteHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

const navigation = [
  ["Calculators", "/calculators"],
  ["Projects", "/projects"],
  ["Guides", "/guides"],
  ["Methodology", "/methodology"],
] as const;

export function SiteHeader({
  ctaHref = "/calculators",
  ctaLabel = "Browse calculators",
}: SiteHeaderProps) {
  // Older calculator pages explicitly passed the homepage calculator anchor.
  // Normalize that legacy destination here so every header now uses the
  // dedicated scalable library without requiring a risky multi-file rewrite.
  const resolvedCtaHref = ctaHref === "/#calculators" ? "/calculators" : ctaHref;

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="shell utility-inner">
          <span>Reference-backed construction planning</span>
          <span className="utility-separator" aria-hidden="true" />
          <span>Metric &amp; Imperial · No sign-up</span>
        </div>
      </div>
      <div className="shell nav-wrap">
        <a className="brand" href="/" aria-label="BuildNumbers home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>BuildNumbers</span>
        </a>

        <nav className="main-nav" aria-label="Primary navigation">
          {navigation.map(([label, href]) => (
            <a href={href} key={href}>{label}</a>
          ))}
        </nav>

        <a className="button button-small button-outline" href={resolvedCtaHref}>
          {ctaLabel}
        </a>

        <details className="mobile-nav">
          <summary aria-label="Open navigation menu">Menu</summary>
          <nav className="mobile-nav-panel" aria-label="Mobile navigation">
            {navigation.map(([label, href]) => (
              <a href={href} key={href}>
                <span>{label}</span>
                <span aria-hidden="true">→</span>
              </a>
            ))}
            <a href={resolvedCtaHref}>
              <span>{ctaLabel}</span>
              <span aria-hidden="true">→</span>
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
