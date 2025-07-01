import { defineConfig, globalIgnores } from 'eslint/config'

import { node } from 'globals'
import parser from 'vue-eslint-parser'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import { configs } from '@eslint/js'

import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: configs.recommended,
  allConfig: configs.all
})

export default defineConfig([
  {
    languageOptions: {
      globals: {
        ...node
      },

      parser: parser,

      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },

    extends: compat.extends('plugin:vue/vue3-recommended'),

    plugins: {
      '@typescript-eslint': typescriptEslint
    },

    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      indent: 'off',
      'no-async-promise-executor': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/no-v-html': 'off',

      'prettier/prettier': [
        'error',
        {},
        {
          usePrettierrc: true
        }
      ]
    }
  },
  {
    files: ['**/*.ts', '**/*.vue'],

    rules: {
      'no-undef': 'off'
    }
  },
  globalIgnores(['src/**/*.d.ts']),
  globalIgnores(['src/**/*.js'])
])
