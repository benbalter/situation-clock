import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["*.js", "*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    ignores: ["assets/", "_site/"],
  }
);
