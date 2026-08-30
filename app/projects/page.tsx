import type { Metadata } from "next";
import { CheckIcon } from "@/components/icons";
import { ProjectMode } from "@/components/project-mode";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Projects — Group Saved Material Estimates",
  description:
    "Group estimates saved from BuildNumbers calculators into local project lists that stay in your browser.",
  alternates: {
    canonical: "/projects",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ProjectsPage() {
  return (
    <main className="calculator-page" data-projects-page="true">
      <SiteHeader ctaHref="/#calculators" ctaLabel="Add an estimate" />

      <section className="calculator-hero">
        <div className="shell">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span>Projects</span>
          </nav>
          <div className="calculator-hero-grid">
            <div>
              <p className="eyebrow">Project Mode</p>
              <h1>Group estimates into one project</h1>
              <p>
                Combine estimates already saved from different BuildNumbers
                calculators into a single material list. Projects stay on this
                device and can be copied, printed, or saved as a PDF when you are
                ready to plan or shop.
              </p>
            </div>
            <ul>
              <li><CheckIcon /> Uses your saved estimates</li>
              <li><CheckIcon /> Works across all thirteen calculators</li>
              <li><CheckIcon /> Stored only in this browser</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="shell calculator-main-section" data-clarity-mask="true">
        <ProjectMode />
      </section>

      <SiteFooter />
    </main>
  );
}
