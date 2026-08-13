import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("./cost-browser-qa.mjs", import.meta.url);
let source = await readFile(sourcePath, "utf8");

function replaceOnce(needle, replacement) {
  const first = source.indexOf(needle);
  if (first < 0) throw new Error(`Missing QA patch marker: ${needle.slice(0, 80)}`);
  if (source.indexOf(needle, first + needle.length) >= 0) {
    throw new Error(`Ambiguous QA patch marker: ${needle.slice(0, 80)}`);
  }
  source = source.slice(0, first) + replacement + source.slice(first + needle.length);
}

replaceOnce(
  `  await loaded;\n  await delay(450);\n}`,
  `  await loaded;\n  await delay(450);\n\n  const dismissedConsent = await evaluate(\n    client,\n    \`(() => {\n      const normalize = (value) => value.replace(/\\\\s+/g, " ").trim();\n      const button = [...document.querySelectorAll("button")]\n        .find((candidate) => normalize(candidate.textContent ?? "") === "No thanks");\n      if (!button) return false;\n      button.click();\n      return true;\n    })()\`,\n  );\n  if (dismissedConsent) await delay(220);\n\n  const consentStillVisible = await evaluate(\n    client,\n    \`(() => [...document.querySelectorAll("button")]\n      .some((candidate) => (candidate.textContent ?? "").replace(/\\\\s+/g, " ").trim() === "No thanks"))()\`,\n  );\n  if (consentStillVisible) {\n    throw new Error("Analytics consent overlay remained visible after dismissal.");\n  }\n}`,
);

replaceOnce(
  `      await screenshot(\n        client,\n        ".surface-summary",\n        \`\${screenshotRoot}/\${config.slug}-360-result.png\`,\n      );`,
  `      await screenshot(\n        client,\n        ".cost-summary",\n        \`\${screenshotRoot}/\${config.slug}-360-result.png\`,\n      );`,
);

replaceOnce(
  `    if (width === 1280) {\n      await screenshot(\n        client,\n        ".calculator-workspace",\n        \`\${screenshotRoot}/\${config.slug}-1280-workspace.png\`,\n      );\n    }`,
  `    if (width === 1280) {\n      await screenshot(\n        client,\n        'input[aria-label^="Price per "]',\n        \`\${screenshotRoot}/\${config.slug}-1280-fields.png\`,\n      );\n      await screenshot(\n        client,\n        ".cost-summary",\n        \`\${screenshotRoot}/\${config.slug}-1280-result.png\`,\n      );\n    }`,
);

const runtimePath = new URL("./.cost-browser-qa-runtime.mjs", import.meta.url);
await writeFile(runtimePath, source, "utf8");

try {
  await import(`${runtimePath.href}?run=${Date.now()}`);
} finally {
  await writeFile(runtimePath, "// generated only during supervised QA\n", "utf8");
}
