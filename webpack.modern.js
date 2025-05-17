const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const commonConfig = require('./webpack.common.js');

module.exports = (env, argv) => {
  const config = commonConfig(env, argv);
  const isProduction = argv.mode === 'production';

  // Enable output as ES module
  config.output.module = true;
  config.experiments = { outputModule: true };

  if (isProduction) {
    config.output.filename = '[name].[contenthash].js';
    config.output.chunkFilename = '[name].[contenthash].js';

    config.plugins = config.plugins.map(plugin => {
      if (plugin instanceof HtmlWebpackPlugin) {
        return new HtmlWebpackPlugin({
          template: './index.html',
          filename: 'index.html',
          inject: 'body',
          scriptLoading: 'module',
          minify: {
            removeComments: false,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: false,
            removeScriptTypeAttributes: false,
            removeStyleLinkTypeAttributes: false,
          },
        });
      }
      return plugin;
    });

    config.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: false,
              passes: 2,
            },
            mangle: true,
            output: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
      usedExports: true,
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 6,
        maxAsyncRequests: 30,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
            priority: 20,
            chunks: 'all',
          },
          sound: {
            test: /[\\/]sound[\\/]|[\\/]assets[\\/]sounds[\\/]/,
            name: 'sound-assets',
            priority: 10,
            chunks: 'async',
          },
          mechanics: {
            test: /[\\/]mechanics[\\/]/,
            name: 'game-mechanics',
            priority: 5,
            chunks: 'async',
          },
        },
      },
    };

    config.devtool = 'source-map';
  } else {
    config.output.filename = '[name].bundle.js';
    config.output.chunkFilename = '[name].bundle.js';

    config.plugins = config.plugins.map(plugin => {
      if (plugin instanceof HtmlWebpackPlugin) {
        return new HtmlWebpackPlugin({
          template: './index.html',
          filename: 'index.html',
          inject: 'body',
          scriptLoading: 'module',
          minify: false,
        });
      }
      return plugin;
    });

    config.devServer = {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 3000,
      // HMR is not supported for ES module output yet
      hot: false,
      historyApiFallback: true,
      devMiddleware: {
        publicPath: '/',
        writeToDisk: true,
      },
    };

    config.devtool = 'eval-source-map';

    config.optimization = {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true,
          },
        },
      },
    };
  }

  return config;
};
