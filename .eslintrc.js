module.exports = {
    extends: ["prettier", "prettier/react"],
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
