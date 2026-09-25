// @ts-check
import nxPlugin from '@nx/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import moduleBoundaries from './eslint.module-boundaries.cjs';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/android/**', '**/ios/**', '**/.nx/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@nx': nxPlugin,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      ...moduleBoundaries,
    },
  },
  prettierConfig,
];
