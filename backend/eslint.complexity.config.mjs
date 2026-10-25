import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "**/tests/**",
      "**/*.test.js",
      "src/Modules/Users/**",
      "src/Modules/Achievements/**",
      "src/Modules/Reservations/**",
    ],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    plugins: { sonarjs },
    rules: {
      complexity: ["warn", 0],
      "sonarjs/cognitive-complexity": ["warn", 0],
    },
  },
];
