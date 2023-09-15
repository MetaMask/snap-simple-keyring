module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        // This prevents using Node.js and/or browser specific globals. We
        // currently use both in our codebase, so this rule is disabled.
        'no-restricted-globals': 'off',
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', '.cache/', 'public/'],
};
