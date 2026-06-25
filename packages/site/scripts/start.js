const { resolve } = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const config = require('../webpack.config');

const compiler = webpack(config);
const server = new WebpackDevServer(config.devServer, compiler);

const stopServer = async () => {
  await server.stop();
};

server.startCallback(() => {
  const { host, port } = config.devServer;
  console.log(`Site running at http://${host}:${port}`);
  console.log(
    `Serving static files from ${resolve(__dirname, '..', 'static')}`,
  );
});

process.on('SIGINT', () => {
  stopServer().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
});

process.on('SIGTERM', () => {
  stopServer().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
});
