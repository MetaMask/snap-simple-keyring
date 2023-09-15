module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      files: ['**/*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        'import/no-nodejs-modules': ['error', { allow: ['buffer'] }],
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', 'dist/'],
};
