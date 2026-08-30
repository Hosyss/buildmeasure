import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Full document navigation is intentional: it avoids shipping the client
    // router on these small, independent calculator pages.
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The Admin Control Plane is an isolated package with its own security gate.
    // Keep the public Next.js lint scope from coupling the two applications.
    "admin-control-plane/**",
  ]),
]);

export default eslintConfig;
