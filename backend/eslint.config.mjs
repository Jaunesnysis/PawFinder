import js from "@eslint/js";
import globals from "globals";
import sonarjs from "eslint-plugin-sonarjs";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js, sonarjs },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.node },
        rules: {
            "complexity": ["warn", 1],
            "sonarjs/cognitive-complexity": ["warn", 1]
        }
    },
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
]);