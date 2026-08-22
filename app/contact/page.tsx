import type { Metadata } from "next";
import { UtilityContentPage } from "@/components/utility-content-page";

export const metadata: Metadata = {
  title: "Contact BuildMeasure",
  description:
    "Contact BuildMeasure about calculator accuracy, privacy, site feedback, or the open-source project.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <UtilityContentPage
      eyebrow="Contact"
      title="Get in touch with BuildMeasure"
      titleStyle={{ fontSize: "clamp(2.65rem, 6vw, 5rem)" }}
      intro="Use the route that best matches your question so calculation issues, privacy requests, and project feedback reach the right review flow."
    >
      <h2>Calculator accuracy or usability</h2>
      <p>
        Use the <a href="/feedback">calculator feedback form</a> to report an
        incorrect result, conversion issue, confusing label, broken interaction,
        or documentation problem. Include the calculator and enough non-sensitive
        detail to reproduce the issue.
      </p>

      <h2>Privacy or data request</h2>
      <p>
        Use the <a href="/feedback">feedback form</a> and choose Other feedback.
        If your request concerns a previously submitted feedback report, include
        its report reference. Do not send passwords, payment information, account
        credentials, or other sensitive personal data.
      </p>

      <h2>Source code and technical issues</h2>
      <p>
        BuildMeasure is independently maintained and its source is public. You
        can review the implementation and release history in the{" "}
        <a href="https://github.com/Hosyss/buildmeasure">BuildMeasure repository</a>.
        Technical reports can also be filed through the site feedback form so
        they follow the same reproduce, test, fix, and verify process.
      </p>

      <h2>Before relying on an estimate</h2>
      <p>
        BuildMeasure provides planning estimates, not project drawings,
        structural approval, supplier quotations, or professional advice. Verify
        material quantities against measured site conditions, manufacturer data,
        supplier order increments, local requirements, and a qualified project
        professional when appropriate.
      </p>

      <div className="utility-link-row">
        <a className="button button-primary" href="/feedback">Report or ask something</a>
        <a className="button button-quiet" href="/about">About BuildMeasure</a>
      </div>
    </UtilityContentPage>
  );
}
