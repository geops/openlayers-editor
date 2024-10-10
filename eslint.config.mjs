import eslint from "@eslint/js";
import pluginCypress from "eslint-plugin-cypress/flat";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import ts from "typescript-eslint";

export default [
  {
    ignores: ["build/*"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  ...ts.config(
    eslint.configs.recommended,
    ...ts.configs.strict,
    ...ts.configs.stylistic,
    pluginCypress.configs.recommended,
    perfectionist.configs["recommended-alphabetical"],
    prettier,
    {
      rules: {
        "@typescript-eslint/prefer-for-of": "off",
        "arrow-body-style": ["error", "always"],
        curly: "error",
        "cypress/no-unnecessary-waiting": "off",
      },
    },
  ),
];
