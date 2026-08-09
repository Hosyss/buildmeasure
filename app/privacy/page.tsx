import type { Metadata } from "next";
import { UtilityContentPage } from "@/components/utility-content-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BuildMeasure handles calculator inputs, saved estimates, and feedback reports.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <UtilityContentPage
      eyebrow="Last updated August 1, 2026"
      title="Privacy policy"
      intro="BuildMeasure is designed to calculate locally, request as little information as possible, and explain the data that is stored."
    >
      <h2>Calculator inputs</h2>
      <p>
        Calculator measurements and results are processed in your browser. They
        are not sent to BuildMeasure&apos;s analytics log. They are sent to the
        feedback database only if you choose to copy them into and submit the
        feedback form.
      </p>

      <h2>Saved estimates on this device</h2>
      <p>
        The Save action stores an estimate in your browser&apos;s local storage so it
        remains available on that device. It is not synchronized to an account.
        Use Clear all in the calculator to remove that saved history.
      </p>

      <h2>Calculator feedback</h2>
      <p>
        When you submit a report, BuildMeasure stores the selected calculator,
        feedback type, text you enter, submission time, and a random anonymous
        browser token used to limit repeated submissions. The form does not ask
        for your name or email. Do not include personal, payment, account, or
        other sensitive information in free-text fields.
      </p>
      <p>
        Feedback reports are retained for up to 24 months so calculation issues
        and regression evidence can be investigated. Include the report
        reference if you later ask for a specific report to be removed.
      </p>

      <h2>Anonymous product analytics</h2>
      <p>
        BuildMeasure records limited first-party events such as opening or using
        a calculator, completing or failing an estimate, using a result action,
        submitting feedback, and browser errors. The event may include the page,
        calculator, coarse browser and device classes, language, external
        referring host, and campaign tags in the link. Browser error details are
        shortened before storage.
      </p>
      <p>
        BuildMeasure&apos;s analytics log does not store IP addresses, names, email
        addresses, raw user-agent strings, or persistent analytics cookies. A
        random identifier is created for the current page load only and is not
        saved in the browser. Analytics events are retained for up to 90 days.
      </p>

      <h2>Hosting and security data</h2>
      <p>
        The managed hosting service may process request metadata and technical
        logs needed to deliver, secure, and diagnose the site. BuildMeasure does
        not run advertising and does not set an advertising cookie. If that
        changes, this policy and any required consent controls will be updated
        before launch.
      </p>

      <h2>Questions or deletion requests</h2>
      <p>
        Use the <a href="/feedback">feedback form</a>, choose Other feedback, and
        include the relevant report reference. Do not place sensitive information
        in the request.
      </p>
    </UtilityContentPage>
  );
}
