/* eslint-disable n/no-process-env */

const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { EnvironmentPlugin } = require('webpack');

const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

const productionConfig = {
  origin: 'npm:@metamask/snap-simple-keyring-snap',
  output: 'static/js/[name].[contenthash:8].js',
  devtool: 'source-map',
  minimize: true,
};

const developmentConfig = {
  origin: 'local:http://localhost:8080',
  output: 'static/js/[name].js',
  devtool: 'eval-source-map',
  minimize: false,
};

const { origin, output, devtool, minimize } =
  mode === 'production' ? productionConfig : developmentConfig;

const normalizePublicPath = (pathPrefix) => {
  if (!pathPrefix) {
    return '/';
  }

  const prefixedPath = pathPrefix.startsWith('/')
    ? pathPrefix
    : `/${pathPrefix}`;

  return prefixedPath.endsWith('/') ? prefixedPath : `${prefixedPath}/`;
};

module.exports = {
  mode,
  entry: './src/index.tsx',
  stats: 'errors-only',
  devtool,
  output: {
    path: resolve(__dirname, 'dist'),
    filename: output,
    assetModuleFilename: 'static/media/[name].[contenthash:8][ext]',
    clean: true,
    publicPath: normalizePublicPath(process.env.PATH_PREFIX),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/u,
        exclude: /node_modules/u,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: mode === 'development',
                },
              },
            },
          },
        },
      },
      {
        test: /\.m?js$/u,
        include: /node_modules/u,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/u,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?)$/u,
        type: 'asset',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      assert: false,
      child_process: false,
      constants: false,
      crypto: false,
      fs: false,
      http: false,
      https: false,
      module: false,
      os: false,
      path: false,
      stream: false,
      util: false,
      worker_threads: false,
      zlib: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new EnvironmentPlugin({
      NODE_ENV: mode,
      SNAP_ORIGIN: origin,
    }),
    new CopyPlugin({
      patterns: [{ from: resolve(__dirname, 'static') }],
    }),
  ],
  optimization: {
    minimize,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
      }),
    ],
  },
  performance: false,
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  devServer: {
    host: 'localhost',
    port: 8000,
    historyApiFallback: true,
  },
};
