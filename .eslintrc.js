module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['@metamask/eslint-config-typescript'],
    },

    {
      files: ['*.js', '*.jsx'],
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['*.test.ts', '*.test.js'],
      extends: [
        '@metamask/eslint-config-jest',
        '@metamask/eslint-config-nodejs',
      ],
    },
  ],

  rules: {
    // This is necessary to run eslint on Windows and not get a thousand CRLF errors
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },

  ignorePatterns: [
    '!.eslintrc.js',
    '!.prettierrc.js',
    'dist/',
    'docs/',
    '.yarn/',
  ],
};
