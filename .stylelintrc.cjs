module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  ignoreFiles: ['**/node_modules/**', '**/dist/**', '**/coverage/**', 'docs/**', 'public/**', 'release/**'],
  rules: {
    'color-hex-length': 'long',
    'import-notation': 'string',
    // Tailwind CSS 4 directives are intentional; misspelled CSS at-rules still fail.
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'theme',
          'source',
          'utility',
          'variant',
          'custom-variant',
          'apply',
          'reference',
          'config',
          'plugin',
        ],
      },
    ],
    'at-rule-prelude-no-invalid': [true, { ignoreAtRules: ['apply'] }],
  },
}
