import { readFile, writeFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

async function write(path, content) {
  await writeFile(path, content, "utf8");
}

function replaceOnce(content, needle, replacement, path) {
  const index = content.indexOf(needle);
  if (index < 0) throw new Error(`Missing integration marker in ${path}: ${needle.slice(0, 80)}`);
  if (content.indexOf(needle, index + needle.length) >= 0) {
    throw new Error(`Ambiguous integration marker in ${path}: ${needle.slice(0, 80)}`);
  }
  return content.slice(0, index) + replacement + content.slice(index + needle.length);
}

const calculators = [
  {
    path: "app/concrete-calculator/concrete-calculator.tsx",
    quantity: "calculation.result?.bags ?? null",
    unitLabel: "`${form.bagSize} lb bag`",
    productField: "bagSize",
    errorId: "concrete-cost-error",
    saveNeedle: "      summary: resultSummary(calculation.result),",
    saveReplacement: "      summary: `${resultSummary(calculation.result)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : \"\"}` ,",
  },
  {
    path: "app/post-hole-concrete-calculator/post-hole-concrete-calculator.tsx",
    quantity: "calculation.result?.bags ?? null",
    unitLabel: "`${form.bagSize} lb bag`",
    productField: "bagSize",
    errorId: "post-hole-cost-error",
    saveNeedle: "      summary: resultSummary(calculation.result),",
    saveReplacement: "      summary: `${resultSummary(calculation.result)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : \"\"}` ,",
  },
  {
    path: "app/paint-calculator/paint-calculator.tsx",
    quantity: "calculation.result?.containers ?? null",
    unitLabel: "`${containerLabel(unitSystem, form.containerLiters)} container`",
    productField: "containerLiters",
    errorId: "paint-cost-error",
    clearOnUnitSwitch: true,
    saveNeedle: `      summary: resultSummary(
        calculation.result,
        unitSystem,
        form.containerLiters,
      ),`,
    saveReplacement: `      summary: \`${"${resultSummary(calculation.result, unitSystem, form.containerLiters)}"}${"${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : \"\"}"}\`,`,
  },
  {
    path: "app/tile-calculator/tile-calculator.tsx",
    quantity: "calculation.result?.boxes ?? null",
    unitLabel: '"box"',
    productField: "tilesPerBox",
    errorId: "tile-cost-error",
    saveNeedle: "      summary: resultSummary(calculation.result),",
    saveReplacement: "      summary: `${resultSummary(calculation.result)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : \"\"}` ,",
  },
  {
    path: "app/gravel-calculator/gravel-calculator.tsx",
    quantity: "calculation.result?.bags ?? null",
    unitLabel: "`${calculation.result ? format(displayBagWeight(calculation.result, unitSystem)) : form.bagWeight} ${unitSystem === \"imperial\" ? \"lb\" : \"kg\"} bag`",
    productField: "bagWeight",
    errorId: "gravel-cost-error",
    saveNeedle: "      summary: resultSummary(calculation.result, unitSystem),",
    saveReplacement: "      summary: `${resultSummary(calculation.result, unitSystem)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : \"\"}` ,",
  },
  {
    path: "app/mulch-calculator/mulch-calculator.tsx",
    quantity: "calculation.result?.bags ?? null",
    unitLabel: "`${calculation.result ? format(displayBagVolume(calculation.result, unitSystem)) : form.bagVolume} ${unitSystem === \"imperial\" ? \"ft³\" : \"L\"} bag`",
    productField: "bagVolume",
    errorId: "mulch-cost-error",
    saveNeedle: "      summary: resultSummary(calculation.result, unitSystem),",
    saveReplacement: "      summary: `${resultSummary(calculation.result, unitSystem)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : \"\"}` ,",
  },
];

for (const config of calculators) {
  let content = await read(config.path);

  const historyImport = 'import { CalculatorHistory } from "@/components/calculator-history";';
  content = replaceOnce(
    content,
    historyImport,
    `${historyImport}\nimport { CalculatorCostFields, CalculatorCostResult } from "@/components/calculator-cost";\nimport { usePurchaseCost } from "@/hooks/use-purchase-cost";\nimport { formatPurchaseCost } from "@/lib/cost-estimate";`,
    config.path,
  );

  const analyticsMarker = "  const markInteraction = useCalculatorAnalytics(";
  const costHook = `  const purchaseUnitLabel = ${config.unitLabel};\n  const purchaseCost = usePurchaseCost(\n    ${config.quantity},\n    purchaseUnitLabel,\n  );\n\n${analyticsMarker}`;
  content = replaceOnce(content, analyticsMarker, costHook, config.path);

  const setFieldMarker = "    markInteraction();\n    setForm((current) => ({ ...current, [field]: value }));";
  content = replaceOnce(
    content,
    setFieldMarker,
    `    markInteraction();\n    if (field === "${config.productField}") purchaseCost.clearUnitPrice();\n    setForm((current) => ({ ...current, [field]: value }));`,
    config.path,
  );

  if (config.clearOnUnitSwitch) {
    const unitSwitchMarker = "  function changeUnitSystem(next: UnitSystem) {\n    if (next === unitSystem) return;\n    markInteraction();";
    content = replaceOnce(
      content,
      unitSwitchMarker,
      `${unitSwitchMarker}\n    purchaseCost.clearUnitPrice();`,
      config.path,
    );
  }

  const resetMarker = "  function reset() {\n    markInteraction();\n    setForm(DEFAULTS[unitSystem]);";
  content = replaceOnce(
    content,
    resetMarker,
    "  function reset() {\n    markInteraction();\n    purchaseCost.resetCost();\n    setForm(DEFAULTS[unitSystem]);",
    config.path,
  );

  const textMarker = "    const text = [";
  content = replaceOnce(
    content,
    textMarker,
    `    const costLine = purchaseCost.result\n      ? \`Estimated material cost: \${formatPurchaseCost(purchaseCost.result)}\`\n      : null;\n    const text = [`,
    config.path,
  );

  const joinMarker = '    ].join("\\n");';
  content = replaceOnce(
    content,
    joinMarker,
    '      ...(costLine ? [costLine] : []),\n    ].join("\\n");',
    config.path,
  );

  content = replaceOnce(
    content,
    config.saveNeedle,
    config.saveReplacement,
    config.path,
  );

  const errorMarker = "        {calculation.error ? (";
  const fields = `        <CalculatorCostFields\n          unitLabel={purchaseUnitLabel}\n          unitPrice={purchaseCost.unitPrice}\n          currencyLabel={purchaseCost.currencyLabel}\n          error={purchaseCost.error}\n          errorId="${config.errorId}"\n          onUnitPriceChange={(value) => {\n            markInteraction();\n            purchaseCost.setUnitPrice(value);\n            setNotice(\"\");\n          }}\n          onCurrencyLabelChange={(value) => {\n            markInteraction();\n            purchaseCost.setCurrencyLabel(value);\n            setNotice(\"\");\n          }}\n        />\n\n${errorMarker}`;
  content = replaceOnce(content, errorMarker, fields, config.path);

  const cautionMarker = '            <p className="result-caution">';
  content = replaceOnce(
    content,
    cautionMarker,
    `            <CalculatorCostResult result={purchaseCost.result} />\n\n${cautionMarker}`,
    config.path,
  );

  await write(config.path, content);
}

const specAppendix = `\n\n## Optional purchase cost layer\n\nThe quantity engine remains the source of truth and is unchanged by optional\npricing. The interface may multiply the engine's complete purchase-package\ncount by a user-entered price for that package. No live price, exchange rate,\ntax, delivery, labor, discount, or supplier minimum is inferred. Package\ndefinition changes clear the entered price to prevent stale-product pricing.\nSee [Optional Purchase Cost Estimator](../COST_ESTIMATOR.md).\n`;

for (const path of [
  "docs/calculators/concrete.md",
  "docs/calculators/post-hole-concrete.md",
  "docs/calculators/paint.md",
  "docs/calculators/tile.md",
  "docs/calculators/gravel.md",
  "docs/calculators/mulch.md",
]) {
  let content = await read(path);
  if (!content.includes("## Optional purchase cost layer")) {
    content = content.trimEnd() + specAppendix;
    await write(path, content);
  }
}

{
  const path = "README.md";
  let content = await read(path);
  const marker = "- Copy, print, reset, and device-local save/history actions.\n";
  content = replaceOnce(
    content,
    marker,
    `${marker}- Optional user-entered purchase-package pricing with approximate material-cost totals; no live prices or currency conversion.\n`,
    path,
  );
  const docsMarker = "- [QA guide](docs/QA.md)\n";
  content = replaceOnce(
    content,
    docsMarker,
    `${docsMarker}- [Optional purchase cost specification](docs/COST_ESTIMATOR.md)\n- [Optional purchase cost QA](docs/COST_ESTIMATOR_QA.md)\n`,
    path,
  );
  await write(path, content);
}

{
  const path = "CHANGELOG.md";
  let content = await read(path);
  const marker = "### Added\n\n";
  content = replaceOnce(
    content,
    marker,
    `${marker}- Added optional user-entered package pricing to all six live calculators, with approximate material-cost totals, currency labels, copy/save integration, stale-package price clearing, and no live-price or exchange-rate assumptions.\n- Added a shared tested cost helper plus a documented cost-estimator scope and release checklist.\n`,
    path,
  );
  await write(path, content);
}

{
  const path = "tests/rendered-html.test.mjs";
  let content = await read(path);
  const marker = 'test("every internal page link resolves in the built application", async () => {';
  const block = `test("renders optional package cost fields on every live calculator", async () => {\n  const workerUrl = new URL("../dist/server/index.js", import.meta.url);\n  workerUrl.searchParams.set("cost-fields", \`${"${process.pid}-${Date.now()}"}\`);\n  const { default: worker } = await import(workerUrl.href);\n  const env = {\n    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },\n  };\n  const ctx = { waitUntil() {}, passThroughOnException() {} };\n  const expectations = [\n    ["/concrete-calculator", /Optional price per 80 lb bag/],\n    ["/post-hole-concrete-calculator", /Optional price per 80 lb bag/],\n    ["/paint-calculator", /Optional price per 1 gal container/],\n    ["/tile-calculator", /Optional price per box/],\n    ["/gravel-calculator", /Optional price per 50 lb bag/],\n    ["/mulch-calculator", /Optional price per 2 ft³ bag/],\n  ];\n\n  for (const [path, pattern] of expectations) {\n    const response = await worker.fetch(\n      new Request(\`http://localhost\${path}\`, {\n        headers: { accept: "text/html" },\n      }),\n      env,\n      ctx,\n    );\n    const html = await response.text();\n    assert.equal(response.status, 200, \`expected \${path} to render\`);\n    assert.match(html, pattern);\n    assert.match(html, /No live prices are fetched/);\n    assert.match(html, /BuildMeasure does not convert currencies or exchange rates/);\n  }\n});\n\n${marker}`;
  content = replaceOnce(content, marker, block, path);
  await write(path, content);
}

console.log("Applied optional cost estimator integration to six calculators.");
