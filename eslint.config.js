import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
// Phase 4.1: Design system governance enabled
import { designSystemConfig } from "./eslint-design-system.config.js";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "build",
      "coverage",
      "node_modules",
      "src/__tests__/mocks/**/*",
      "src/__tests__/fixtures/**/*",
      "src/__tests__/utils/enhanced-test-utils.tsx",
      "src/integrations/supabase/types.ts",
      // Ignore design system violations in specific files
      "src/shared/ui/thirdparty/**/*",
      "src/core/error-handling/ErrorBoundary.tsx"
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      // Phase 4.1: Design system plugins enabled
      ...designSystemConfig.plugins,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Temporarily disabled for cleanup - Will be re-enabled after critical fixes
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",

      // Accessibility rules (WCAG 2.2 compliance)
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/role-supports-aria-props": "error",

      // Phase 4.1: Design System Governance Rules enabled
      ...designSystemConfig.rules,
    },
  },
  // Configuração específica para arquivos de teste
  {
    files: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "prefer-const": "off",
      // Disable design system rules for test files
      "adega/no-hardcoded-colors": "off",
      "adega/no-arbitrary-values": "off",
      "adega/prefer-semantic-colors": "off",
      "adega/require-size-tokens": "off",
    }
  }
);
