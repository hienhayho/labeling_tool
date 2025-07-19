import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "no-unused-vars": "warn",
    },
  },
  {
    ignores: [
      "src/client/**/*.gen.ts",
      "src/client/**/*.gen.tsx",
      "src/client/client/client.ts",
      "src/client/client/types.ts",
      "src/client/core/bodySerializer.ts",
      "src/client/transformers.gen.ts",
    ],
  },
];

export default eslintConfig;
