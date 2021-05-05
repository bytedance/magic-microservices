module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'standard',
    'prettier',
    'prettier/standard',
  ],
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ['@typescript-eslint', 'promise', 'prettier', 'standard'],
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          '{}': false,
        },
      },
    ],
  },
};
