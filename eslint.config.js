export default [
  {
    files: ["src/js/**/*.js", "scripts/**/*.mjs", "tests/**/*.mjs", "*.js"],
    rules: {
      "no-unused-vars": "error",
      "no-constant-condition": "error",
      eqeqeq: "error",
    },
  },
];
