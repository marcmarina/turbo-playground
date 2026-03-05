import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config({
  files: ['**/*.ts'],
  extends: tseslint.configs.recommended,
  languageOptions: {
    parserOptions: {
      project: true,
    },
  },
  plugins: {
    'simple-import-sort': simpleImportSort,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'new-cap': ['error', { capIsNewExceptions: ['Router', 'Fastify'] }],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'],
          ['^node:'],
          ['^@?\\w'],
          ['^@app'],
          ['^'],
          ['^\\.\\.'],
          ['^\\.'],
        ],
      },
    ],
  },
});
