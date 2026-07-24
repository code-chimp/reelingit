import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  { ignores: ['dist'] },
  // general JavaScript hygiene
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended', prettier],
    languageOptions: { globals: { ...globals.browser, app: 'readonly' } },
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'smart'],
      'no-console': ['error', { allow: ['error', 'warn'] }],
      'no-implicit-coercion': 'error',
      'no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
        },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  // vitest unit tests
  {
    files: ['**/*.test.js'],
    plugins: { vitest },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals, // Add Vitest globals
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'no-magic-numbers': 'off',
      'vitest/max-nested-describe': ['error', { max: 3 }],
    },
  },
  // configuration and utility files
  {
    files: ['*.config.{js,mjs}', 'vitest.setup.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  // watch html for obvious a11y deficiencies
  {
    ...html.configs['flat/recommended'],
    files: ['**/*.html'],
    plugins: { '@html-eslint': html },
    languageOptions: { parser: htmlParser },
    rules: {
      '@html-eslint/indent': 'off',
      '@html-eslint/quotes': 'off',
      '@html-eslint/attrs-newline': 'off',
      '@html-eslint/element-newline': 'off',
      '@html-eslint/no-extra-spacing-tags': 'off',
      '@html-eslint/require-closing-tags': 'off',
    },
  },
  // keep JSON well formed
  {
    files: ['**/*.json'],
    ignores: ['package-lock.json', 'custom-elements.json'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },
  // Github Flavored Markdown
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended'],
  },
]);
