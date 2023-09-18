// eslint-disable-next-line jsdoc/valid-types
/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require('@yarnpkg/types');

module.exports = defineConfig({
  async constraints({ Yarn }) {
    for (const dep of Yarn.dependencies({ ident: 'eslint' })) {
      if (dep.range !== `18.0.0`) {
        dep.update(`18.0.0`);
      }
    }

    for (const workspace of Yarn.workspaces()) {
      workspace.set(
        'scripts.lint',
        `yarn constraints && yarn lint:eslint && yarn lint:misc --check && yarn lint:deps && yarn lint:types`,
      );

      workspace.set(
        'scripts.lint:eslint',
        `eslint . --cache --ext js,jsx,ts,tsx`,
      );

      workspace.set(
        'scripts.lint:fix',
        `yarn constraints --fix && yarn lint:eslint --fix && yarn lint:misc --write`,
      );
    }
  },
});
