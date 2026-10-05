import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react-x";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginTailwindcss from "eslint-plugin-tailwindcss";

export default defineConfig([
  // 2. Include the recommended config
  eslintPluginTailwindcss.configs["flat/recommended"] ||
    eslintPluginTailwindcss.configs.recommended,

  // 3. Define your own settings
  {
    settings: {
      // Define the tailwindcss settings with the MANDATORY `cssConfigPath`
      tailwindcss: {
        cssConfigPath: "./src/styles/index.css",
      },
    },
    // Optional: Customize the rules to your needs
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-arbitrary-value": "warn",
      "tailwindcss/no-custom-classname": [
        "warn",
        { whitelist: ["custom\\-*"] },
      ],
      "tailwindcss/no-contradicting-classname": "warn",
    },
  },

  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,

      tseslint.configs.recommended,
      // Remove tseslint.configs.recommended and replace with this
      // tseslint.configs.recommendedTypeChecked,

      // Alternatively, use this for stricter rules
      // tseslint.configs.strictTypeChecked,

      // Optionally, add this for stylistic rules
      // tseslint.configs.stylisticTypeChecked,

      tseslint.configs.stylistic,

      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      react.configs.recommended,
      reactX.configs["recommended-typescript"],
      reactDom.configs.recommended,
      perfectionist.configs["recommended-natural"],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // rules: {
    //   "max-lines": [
    //     "warn",
    //     {
    //       max: 300,
    //       skipBlankLines: true,
    //       skipComments: true,
    //     },
    //   ],
    // },
  },
]);
