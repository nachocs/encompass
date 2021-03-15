module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    browser: true
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "warn"
  },
  globals: {
    Promise: false,
    process: false,
  }
};
