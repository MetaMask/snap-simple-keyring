module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      globals: {
        window: true,
      },
      files: ['**/*.{ts,tsx}'],
      rules: {
        'jsdoc/require-jsdoc': 0,
        'no-alert': 'off',
        'no-restricted-globals': 0,
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', 'build/'],
};
