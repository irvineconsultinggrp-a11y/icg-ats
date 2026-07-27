import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Dashboard pages intentionally load data on mount via `useEffect(() => void loadX())`,
      // where the loader sets a loading flag synchronously. This advisory rule (new in the
      // React 19 hooks plugin) flags that pattern app-wide; the fetch-in-effect approach is
      // deliberate here, so we disable it rather than restructure every working data-loader.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
