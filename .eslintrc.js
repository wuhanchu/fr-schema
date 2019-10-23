module.exports = {
    // extends: ["prettier", "prettier/react"],
    extends: ["plugin:prettier/recommended"],

    parser: "babel-eslint",
    plugins: ["prettier"],
    rules: {},
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },

    env: {
        browser: true,
        node: true
    }
}
