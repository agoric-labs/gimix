module.exports = {
  root: true,
  env: {
    node: true,
    es2023: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  ignorePatterns: ["database", "coverage", ".eslintrc.cjs"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "all",
        vars: "all",
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
      },
    ],
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-unpublished-import": "off",
    "node/no-missing-import": [
      "warn", // XXX need to get eslint to recognize .js extensions will be resolved .ts files
      {
        allowModules: ["ava"],
        resolvePaths: [__dirname],
        tryExtensions: [".js", ".ts", ".node"],
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    "import/extensions": [".js", ".ts"],
  },
};
