import type { Metadata } from "next";
import { UtilityContentPage } from "@/components/utility-content-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BuildMeasure handles calculator inputs, saved estimates and projects, analytics, advertising, and feedback reports.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <UtilityContentPage
      eyebrow="Last updated August 22, 2026"
      title="Privacy policy"
      intro="BuildMeasure is designed to calculate locally, request as little information as possible, and explain the data that is stored or processed."
    >
      <h2>Calculator inputs</h2>
      <p>
        Calculator measurements and results are processed in your browser. They
        are not sent to BuildMeasure&apos;s first-party analytics log. They are sent
        to the feedback database only if you choose to copy them into and submit
        the feedback form.
      </p>

      <h2>Saved estimates and projects on this device</h2>
      <p>
        The Save action stores an estimate in your browser&apos;s local storage so it
        remains available on that device. Project Mode can copy selected saved
        estimates into a named project, which is also stored only in local
        browser storage. Estimates and projects are not synchronized to an
        account or sent to BuildMeasure.
      </p>
      <p>
        Use Clear all in a calculator to remove that calculator&apos;s saved-history
        list. A project is a separate local snapshot, so clearing calculator
        history does not delete an existing project. Use Delete in Project Mode
        to remove a project. Clearing browser site data can remove both saved
        estimates and projects.
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
        a calculator, clicking into a calculator from the homepage or a guide,
        completing or failing an estimate, using the optional cost feature or a
        result action, submitting feedback, and browser errors. The event may
        include the page, calculator, coarse browser and device classes,
        language, external referring host, and campaign tags in the link.
        Browser error details are shortened before storage.
      </p>
      <p>
        Calculator-entry events use only a fixed source label (homepage or
        guide), and cost-feature events record only that the feature was used.
        Measurements, quantities, entered unit prices, currency labels, and
        calculated costs are not copied into the first-party analytics event.
      </p>
      <p>
        BuildMeasure&apos;s first-party analytics log does not store IP addresses,
        names, email addresses, raw user-agent strings, or persistent analytics
        cookies. A random identifier is created for the current page load only
        and is not saved in the browser. Analytics events are retained for up to
        90 days.
      </p>

      <h2>Microsoft Clarity</h2>
      <p>
        If you choose Allow analytics, BuildMeasure loads Microsoft Clarity to
        understand navigation, clicks, scrolling, session flow, and technical
        friction. Clarity is not loaded before that choice. BuildMeasure keeps
        Clarity advertising storage disabled and does not send custom user
        identifiers through the Clarity Identify API.
      </p>
      <p>
        Microsoft Clarity masks input-box and dropdown content in its recordings
        by default. BuildMeasure also explicitly masks the Project Mode workspace
        so project names and saved-estimate text are not uploaded in Clarity
        recordings. Clarity may otherwise process device, browser, approximate
        location, interaction, and session data under Microsoft&apos;s privacy terms.
        You can change or withdraw your analytics choice at any time using
        Analytics choices in the site footer. Withdrawing consent clears Clarity
        cookie consent and reloads the page without loading Clarity again.
      </p>

      <h2>Advertising and Google AdSense</h2>
      <p>
        BuildMeasure is being prepared to use Google AdSense. If Google ads are
        enabled, third-party vendors including Google may use cookies or similar
        identifiers to serve, measure, and personalize ads based on a visitor&apos;s
        prior visits to BuildMeasure or other websites.
      </p>
      <p>
        Google&apos;s use of advertising cookies enables Google and its partners to
        serve ads based on visits to this site and other sites on the Internet.
        Visitors can manage or opt out of personalized advertising through{" "}
        <a href="https://adssettings.google.com/">Google Ads Settings</a>. Where
        consent is required, BuildMeasure will use a Google-certified consent
        management platform before personalized ads are served. Calculator
        measurements, saved project names, entered unit prices, and calculated
        costs are not intentionally supplied to AdSense as custom
        advertising-targeting data.
      </p>

      <h2>Hosting and security data</h2>
      <p>
        The managed hosting service may process request metadata and technical
        logs needed to deliver, secure, and diagnose the site. The AdSense site
        verification metadata and ads.txt declaration do not themselves create
        an advertising profile. Advertising code will be enabled only as part of
        the approved AdSense setup and with required consent controls.
      </p>

      <h2>Questions or deletion requests</h2>
      <p>
        Use the <a href="/contact">contact page</a> or the{" "}
        <a href="/feedback">feedback form</a>. For a stored feedback report,
        include the relevant report reference and do not place sensitive
        information in the request.
      </p>
    </UtilityContentPage>
  );
}
