export default [
  {
    files: ["*.js"],
    ignores: ["eslint.config.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        alert: "readonly",
        document: "readonly",
        Event: "readonly",
        HTMLTextAreaElement: "readonly",
        location: "readonly",
        requestAnimationFrame: "readonly",
        URL: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "error"
    }
  }
];
