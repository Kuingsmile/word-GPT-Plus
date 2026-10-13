import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import configPrettier from 'eslint-config-prettier/flat'
import jsonc from 'eslint-plugin-jsonc'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unicorn from 'eslint-plugin-unicorn'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import * as jsoncParser from 'jsonc-eslint-parser'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

const codeFiles = ['**/*.{js,mjs,cjs,ts,vue}']
const appFiles = ['src/**/*.{ts,vue}']

export default defineConfig(
  globalIgnores(['**/node_modules/**', '**/dist/**', '**/coverage/**', 'docs/**', 'public/**', 'release/**']),
  {
    name: 'project/javascript',
    files: codeFiles,
    extends: [js.configs.recommended],
    plugins: { 'simple-import-sort': simpleImportSort, unicorn },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unicorn/prefer-node-protocol': 'error',
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-object-spread': 'error',
    },
  },
  {
    name: 'project/node-tooling',
    files: ['*.config.{js,mjs,cjs}', '.*rc.cjs', 'scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    name: 'project/browser',
    files: [...appFiles, 'async_hook.js'],
    languageOptions: { globals: { ...globals.browser, Office: 'readonly', Word: 'readonly' } },
  },
  {
    name: 'project/typescript',
    files: appFiles,
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // The compiler checks identifiers in TypeScript, including Office.js globals.
      'no-undef': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    name: 'project/vue',
    files: ['src/**/*.vue'],
    extends: [vue.configs['flat/recommended']],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser },
    },
    rules: { 'vue/multi-word-component-names': ['error', { ignores: ['Home', 'Message'] }] },
  },
  {
    name: 'project/json',
    files: ['**/*.json', '**/*.jsonc', '.prettierrc'],
    languageOptions: { parser: jsoncParser },
    plugins: { jsonc },
    rules: Object.assign({}, ...jsonc.configs['flat/recommended-with-jsonc'].map(config => config.rules)),
  },
  {
    name: 'project/translations',
    files: ['src/i18n/locales/*.json'],
    rules: { 'jsonc/sort-keys': ['error', 'asc', { caseSensitive: false, natural: true }] },
  },
  // Prettier owns layout; ESLint owns code quality and import order.
  configPrettier,
)
