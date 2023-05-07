module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module',
  },
  ignorePatterns: [
    './lib/**/*', // Ignore built files.
    './lib/*', // Ignore built files.
    './node_modules/**/*', // Ignore dependencies.
  ],
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
    // 'quotes': ['error', 'double'],
    'import/no-unresolved': 0,
    'indent': ['error', 2],
    'no-console': 0,
    'max-len': 0,
    'space-before-function-paren': 0,
    'comma-dangle': 0,
    'prefer-const': 2,
    'no-extra-semi': 2,
    'no-empty': 0,
    'no-var': 2,
    'no-case-declarations': 2,
    'no-useless-escape': 2,
    'no-prototype-builtins': 0
  },
};
