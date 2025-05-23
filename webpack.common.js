const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/**
 * Base webpack configuration shared by legacy and modern builds
 * @param {Object} env - Environment variables
 * @param {Object} argv - CLI arguments including mode
 * @returns {Object} Webpack configuration
 */
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const analyzeBundle = env && env.analyze === 'true';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      assetModuleFilename: 'assets/[name][ext][query]',
      publicPath: isProduction ? './' : '/',
    },
    resolve: {
      alias: {
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@ai': path.resolve(__dirname, 'src/ai'),
        '@models': path.resolve(__dirname, 'src/models'),
        '@mechanics': path.resolve(__dirname, 'src/mechanics'),
        '@state': path.resolve(__dirname, 'src/state'),
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.(wav|mp3)$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 25 * 1024,
            },
          },
          generator: {
            filename: 'assets/sounds/[name][ext][query]',
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        inject: 'body',
        scriptLoading: 'defer',
        minify: isProduction
          ? {
              removeComments: false,
              collapseWhitespace: true,
              removeAttributeQuotes: true,
              removeRedundantAttributes: false,
              removeScriptTypeAttributes: false,
              removeStyleLinkTypeAttributes: false,
            }
          : false,
      }),
      new CopyWebpackPlugin({
        patterns: [
          // Legacy JavaScript files needed for backward compatibility
          { from: 'game.js', to: '[name][ext]' },
          { from: 'main.js', to: '[name][ext]' },
          { from: 'mc.js', to: '[name][ext]' },
          { from: 'areadice.js', to: '[name][ext]' },
          { from: 'config.js', to: '[name][ext]', noErrorOnMissing: true },
          { from: 'config-ai-vs-ai.js', to: '[name][ext]', noErrorOnMissing: true },

          // Bridge loader for legacy compatibility
          { from: 'src/game-loader.js', to: 'game-loader.js' },
          { from: 'src/gameWrapper.js', to: 'src/gameWrapper.js' },

          // CSS files
          { from: '*.css', to: '[name][ext]', noErrorOnMissing: true },

          // Sound assets
          { from: 'sound', to: 'sound' },
        ],
      }),
      new CleanWebpackPlugin(),
      ...(analyzeBundle
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              reportFilename: 'bundle-report.html',
              openAnalyzer: false,
              generateStatsFile: true,
              statsFilename: 'bundle-stats.json',
            }),
          ]
        : []),
    ],
  };
};
