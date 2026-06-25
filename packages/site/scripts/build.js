const { cpSync, existsSync } = require('fs');
const { resolve } = require('path');
const webpack = require('webpack');

const config = require('../webpack.config');

const copyStaticFiles = () => {
  const staticPath = resolve(__dirname, '..', 'static');
  const distPath = resolve(__dirname, '..', 'dist');

  if (existsSync(staticPath)) {
    cpSync(staticPath, distPath, { recursive: true });
  }
};

const compiler = webpack(config);

compiler.run((error, stats) => {
  compiler.close((closeError) => {
    if (error || closeError) {
      console.error(error || closeError);
      process.exitCode = 1;
      return;
    }

    if (!stats) {
      console.error('Webpack did not return build stats.');
      process.exitCode = 1;
      return;
    }

    if (stats.hasErrors()) {
      console.error(
        stats.toString({
          colors: true,
          errors: true,
        }),
      );
      process.exitCode = 1;
      return;
    }

    copyStaticFiles();

    console.log(
      stats.toString({
        colors: true,
        errors: true,
        warnings: true,
      }),
    );
  });
});
