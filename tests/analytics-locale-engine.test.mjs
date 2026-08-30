import assert from "node:assert/strict";
import test from "node:test";
import { validateAnalyticsPayload } from "../lib/analytics.ts";

function payload(locale) {
  return {
    event: "calculator_opened",
    calculator: "column-calculator",
    route: "/column-calculator",
    sessionToken: "123e4567-e89b-12d3-a456-426614174000",
    source: "direct",
    medium: "",
    campaign: "",
    referrerHost: "",
    browser: "chrome",
    device: "mobile",
    locale,
    detail: "",
  };
}

test("accepts bounded POSIX locale modifiers emitted by headless browsers", () => {
  assert.equal(validateAnalyticsPayload(payload("en-US@posix")).ok, true);
  assert.equal(validateAnalyticsPayload(payload("en_US.UTF-8")).ok, true);
});

test("still rejects locale text outside the bounded safe character set", () => {
  assert.equal(validateAnalyticsPayload(payload("en US<script>")).ok, false);
  assert.equal(validateAnalyticsPayload(payload("x".repeat(21))).ok, false);
});
