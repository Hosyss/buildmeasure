import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function UtilityContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="utility-page-hero utility-page-hero-compact">
          <div className="shell">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
        </section>
        <section className="shell utility-content">
          <article>{children}</article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
