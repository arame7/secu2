const { addWebpackPlugin, override } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ),
  (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      process: require.resolve('process'),
      buffer: require.resolve('buffer/'),
    };
    return config;
  }
);
