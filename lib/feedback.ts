export const FEEDBACK_CALCULATORS = [
  ["concrete-calculator", "Concrete Calculator"],
  ["footing-calculator", "Footing Concrete Calculator"],
  ["column-calculator", "Column Concrete Calculator"],
  ["wall-calculator", "Concrete Wall Calculator"],
  ["post-hole-concrete-calculator", "Post Hole Concrete Calculator"],
  ["paint-calculator", "Paint Calculator"],
  ["tile-calculator", "Tile Calculator"],
  ["gravel-calculator", "Gravel Calculator"],
  ["mulch-calculator", "Mulch Calculator"],
  ["brick-calculator", "Brick Calculator"],
  ["drywall-calculator", "Drywall Calculator"],
] as const;

export const FEEDBACK_CATEGORIES = [
  ["result_issue", "The result seems wrong"],
  ["unit_conversion", "Unit conversion issue"],
  ["usability", "Something is hard to use"],
  ["content", "Explanation or reference issue"],
  ["other", "Other feedback"],
] as const;

export type FeedbackCalculator = (typeof FEEDBACK_CALCULATORS)[number][0];
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number][0];

export type FeedbackSubmission = {
  calculator: FeedbackCalculator;
  category: FeedbackCategory;
  calculationInputs: string;
  actualResult: string;
  expectedResult: string;
  details: string;
  clientToken: string;
};

type FeedbackValidationResult =
  | { ok: true; value: FeedbackSubmission }
  | { ok: false; error: string };

const calculatorKeys = new Set<string>(
  FEEDBACK_CALCULATORS.map(([key]) => key),
);
const categoryKeys = new Set<string>(
  FEEDBACK_CATEGORIES.map(([key]) => key),
);

function readText(value: unknown, maximum: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length <= maximum ? text : null;
}

export function isFeedbackCalculator(
  value: string | undefined,
): value is FeedbackCalculator {
  return typeof value === "string" && calculatorKeys.has(value);
}

export function feedbackCalculatorLabel(calculator: FeedbackCalculator) {
  return FEEDBACK_CALCULATORS.find(([key]) => key === calculator)?.[1] ?? calculator;
}

export function feedbackCategoryLabel(category: FeedbackCategory) {
  return FEEDBACK_CATEGORIES.find(([key]) => key === category)?.[1] ?? category;
}

export function validateFeedbackPayload(
  payload: unknown,
  now = Date.now(),
): FeedbackValidationResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Submit the feedback form again." };
  }

  const data = payload as Record<string, unknown>;
  if (typeof data.website === "string" && data.website.trim()) {
    return { ok: false, error: "The report could not be submitted." };
  }

  const startedAt = typeof data.startedAt === "number" ? data.startedAt : NaN;
  if (
    !Number.isFinite(startedAt) ||
    startedAt > now ||
    now - startedAt < 2_000 ||
    now - startedAt > 86_400_000
  ) {
    return { ok: false, error: "Please review the form, then submit it again." };
  }

  const calculator = readText(data.calculator, 40);
  const category = readText(data.category, 40);
  const calculationInputs = readText(data.calculationInputs, 1_000);
  const actualResult = readText(data.actualResult, 500);
  const expectedResult = readText(data.expectedResult, 500);
  const details = readText(data.details, 2_000);
  const clientToken = readText(data.clientToken, 100);

  if (!calculator || !calculatorKeys.has(calculator)) {
    return { ok: false, error: "Choose the calculator this report is about." };
  }
  if (!category || !categoryKeys.has(category)) {
    return { ok: false, error: "Choose a feedback type." };
  }
  if (calculationInputs === null || actualResult === null || expectedResult === null) {
    return { ok: false, error: "One of the report fields is too long." };
  }
  if (!details || details.length < 20) {
    return { ok: false, error: "Add at least 20 characters so we can investigate." };
  }
  if (!clientToken || !/^[a-zA-Z0-9-]{20,100}$/.test(clientToken)) {
    return { ok: false, error: "Refresh the page and submit the report again." };
  }

  return {
    ok: true,
    value: {
      calculator: calculator as FeedbackCalculator,
      category: category as FeedbackCategory,
      calculationInputs,
      actualResult,
      expectedResult,
      details,
      clientToken,
    },
  };
}
