const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/**
 * Webpack configuration with environment-specific settings
 * @param {Object} env - Environment variables
 * @param {Object} argv - CLI arguments including mode
 * @returns {Object} Webpack configuration
 */
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const analyzeBundle = env && env.analyze === 'true';

  // Base configuration used for both development and production
  const config = {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      assetModuleFilename: 'assets/[name][ext][query]',
      publicPath: '/',
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
          type: 'asset/resource', // Force emitting all sound files as resources
          generator: {
            filename: 'assets/sounds/[name][ext][query]',
          },
        },
      ],
    },
    plugins: [
      // Define environment variables for conditional code
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        // Allow webpack to inject the bundle scripts but specifically control order
        inject: false, // We will manually control script injection
        // Minify HTML in production
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true,
            }
          : false,
        // Ensure scripts are loaded in the correct order
        templateParameters: {
          createJsScript: 'https://code.createjs.com/1.0.0/createjs.min.js',
          gameLoaderScript: 'game-loader.js',
          areadiceScript: 'areadice.js',
          mcScript: 'mc.js',
          // Other scripts will be injected by HtmlWebpackPlugin
        }
      }),
      new CopyWebpackPlugin({
        patterns: [
          // Copy all the legacy JS files
          { from: '*.js', to: '[name].js', globOptions: { ignore: ['webpack.config.js'] } },
          // Copy game-loader.js specifically
          { from: 'src/game-loader.js', to: 'game-loader.js' },
          // Copy CSS files if any
          { from: '*.css', to: '[name].css', noErrorOnMissing: true },
          // Copy debug HTML
          { from: 'debug.html', to: 'debug.html', noErrorOnMissing: true },
          // Copy sound files directly as well to ensure they're available
          { from: 'sound/*.wav', to: 'assets/sounds/[name].wav' },
          // Copy serve.json for development server
          { from: 'serve.json', to: 'serve.json', noErrorOnMissing: true },
        ],
      }),
      // Clean the output directory before each build
      new CleanWebpackPlugin(),
      // Add bundle analyzer when env.analyze is true
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

  // Add common optimization settings
  config.optimization = {
    // Enable tree shaking (dead code elimination)
    usedExports: true,
    // Runtime code for dynamic imports
    runtimeChunk: 'single',
    // Split code into chunks
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 6,
      maxAsyncRequests: 30,
      minSize: 20000,
      cacheGroups: {
        // Create a chunk for vendor code
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 20,
          chunks: 'all',
        },
        // Group sound-related code together
        sound: {
          test: /[\\/]sound[\\/]|[\\/]assets[\\/]sounds[\\/]/,
          name: 'sound-assets',
          priority: 10,
          chunks: 'async',
        },
        // Group mechanics-related code together
        mechanics: {
          test: /[\\/]mechanics[\\/]/,
          name: 'game-mechanics',
          priority: 5,
          chunks: 'async',
        },
      },
    },
  };

  // Production-specific configuration
  if (isProduction) {
    // Use chunking and content hashing for bundle files
    config.output.filename = '[name].[contenthash].js';
    config.output.chunkFilename = '[name].[contenthash].js';

    // Add production optimization settings
    config.optimization.minimize = true;
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false, // Keep console logs for now
            passes: 2, // Multiple optimization passes
          },
          mangle: true,
          output: {
            comments: false, // Remove comments
          },
        },
        extractComments: false, // Don't extract comments to separate file
      }),
    ];

    // No source maps in production for smaller bundle size
    config.devtool = false;
  } else {
    // Development-specific configuration
    config.output.filename = '[name].bundle.js';
    config.output.publicPath = '';  // Use relative paths for dev to make static serve work

    // Add dev server settings - keeping this for reference
    config.devServer = {
      static: {
        directory: path.join(__dirname, './'),
      },
      compress: true,
      port: 8081,
      hot: true,
      devMiddleware: {
        publicPath: '/',
      },
    };

    // Use detailed source maps for better debugging
    config.devtool = 'eval-source-map';
  }

  return config;
};
