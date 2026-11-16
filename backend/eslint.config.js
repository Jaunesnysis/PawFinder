const js = require("@eslint/js");
const sonarjs = require("eslint-plugin-sonarjs");
const globals = require("globals");

module.exports = [
    js.configs.recommended,

    {
        files: ["src/**/*.js"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",

            globals: {
                ...globals.node,
            },
        },

        plugins: {
            sonarjs,
        },

        rules: {
            "complexity": ["warn", 10],
            "sonarjs/cognitive-complexity": ["warn", 10],
            "no-unused-vars": ["warn", {
                argsIgnorePattern: "^_"
            }],
        },
    },

    {
        files: ["**/*.test.js", "**/tests/**/*.js"],

        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.node,
            },
        },
    },

    {
        ignores: [
            "node_modules/**",
            "report/**"
        ],
    },
];