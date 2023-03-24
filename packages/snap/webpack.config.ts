/* eslint-disable no-restricted-globals */
import SnapsWebpackPlugin, { Options } from '@metamask/snaps-webpack-plugin';
// eslint-disable-next-line import/no-nodejs-modules
import { resolve } from 'path';
import webpack, { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import WebpackBarPlugin from 'webpackbar';

const options: Options = {
  /**
   * Whether to strip all comments from the bundle.
   */
  stripComments: false,

  /**
   * Whether to evaluate the bundle with SES, to ensure SES compatibility.
   */
  eval: true,

  /**
   * The path to the Snap manifest file. If set, it will be checked and automatically updated with
   * the bundle's hash, if `writeManifest` is enabled. Defaults to `snap/manifest.json` in the
   * current working directory.
   */
  manifestPath: './snap.manifest.json',

  /**
   * Whether to write the updated Snap manifest file to disk. If `manifestPath` is not set, this
   * option has no effect. If this is disabled, an error will be thrown if the manifest file is
   * invalid.
   */
  writeManifest: true,
};

// Configuration that is shared between the two bundles
const common: Configuration = {
  // For simplicity, we don't do any optimisations here. Ideally, this would be
  // dependent on the `NODE_ENV` or script you're running.
  mode: 'none',
  devtool: 'source-map',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(m?js|ts)x?$/u,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /@chainsafe\/as-sha256/u,
        use: 'null-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts'],
    fallback: {
      buffer: require.resolve('buffer'),
    },
  },
  plugins: [
    new WebpackBarPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  stats: 'errors-only',
  watchOptions: {
    ignored: ['**/snap.manifest.json'],
  },
};

// Configuration for the Snap bundle
const snapConfig: Configuration = merge(common, {
  entry: {
    snap: './src/index.ts',
  },
  output: {
    // Required so that webpack doesn't mangle our `exports` variable
    libraryTarget: 'commonjs',
  },
  plugins: [new SnapsWebpackPlugin(options)],
});

const config = [snapConfig];
export default config;
