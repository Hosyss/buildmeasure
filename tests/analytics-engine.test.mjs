import assert from "node:assert/strict";
import test from "node:test";
import { validateAnalyticsPayload } from "../lib/analytics.ts";

function validPayload(overrides = {}) {
  return {
    event: "calculation_completed",
    calculator: "concrete-calculator",
    route: "/concrete-calculator",
    sessionToken: "123e4567-e89b-12d3-a456-426614174000",
    source: "beta_launch",
    medium: "community",
    campaign: "first_users",
    referrerHost: "example.com",
    browser: "chrome",
    device: "desktop",
    locale: "en-US",
    detail: "",
    ...overrides,
  };
}

test("accepts a bounded anonymous calculator event", () => {
  const result = validateAnalyticsPayload(validPayload());

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.event, "calculation_completed");
    assert.equal(result.value.calculator, "concrete-calculator");
    assert.equal(result.value.referrerHost, "example.com");
  }
});

test("accepts site-wide error events without a calculator", () => {
  const result = validateAnalyticsPayload(
    validPayload({
      event: "client_error",
      calculator: "",
      route: "/",
      detail: "Script error",
    }),
  );

  assert.equal(result.ok, true);
});

test("accepts a privacy-conscious site-wide engagement event", () => {
  const result = validateAnalyticsPayload(
    validPayload({
      event: "page_engaged",
      calculator: "",
      route: "/guides/material-estimating-basics",
      detail: "",
    }),
  );

  assert.equal(result.ok, true);
});

test("rejects unknown events, calculators, browsers, and devices", () => {
  assert.equal(validateAnalyticsPayload(validPayload({ event: "page_view" })).ok, false);
  assert.equal(validateAnalyticsPayload(validPayload({ calculator: "roofing-calculator" })).ok, false);
  assert.equal(validateAnalyticsPayload(validPayload({ browser: "chrome-raw-user-agent" })).ok, false);
  assert.equal(validateAnalyticsPayload(validPayload({ device: "television" })).ok, false);
});

test("rejects malformed sessions and routes", () => {
  assert.equal(validateAnalyticsPayload(validPayload({ sessionToken: "short" })).ok, false);
  assert.equal(validateAnalyticsPayload(validPayload({ route: "https://example.com/private" })).ok, false);
  assert.equal(validateAnalyticsPayload(validPayload({ route: "/path?secret=value" })).ok, false);
});

test("rejects oversized analytics fields", () => {
  assert.equal(validateAnalyticsPayload(validPayload({ detail: "x".repeat(201) })).ok, false);
  assert.equal(validateAnalyticsPayload(validPayload({ referrerHost: "x".repeat(256) })).ok, false);
  assert.equal(validateAnalyticsPayload(validPayload({ campaign: "x".repeat(65) })).ok, false);
});
