// eslint.config.js
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "src/generated/**/*",
      "node_modules/**/*",
      ".next/**/*",
      "dist/**/*"
    ],
    rules: {
      semi: "error",
      "prefer-const": "error",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
