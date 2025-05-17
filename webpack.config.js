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
      // Use different publicPath for production vs development
      publicPath: isProduction ? './' : '/',
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
              // Inline files smaller than 25kb, otherwise use separate files
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
      // Define environment variables for conditional code
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        // Only inject webpack bundles after existing scripts
        inject: 'body',
        // Use defer to prevent blocking page load
        scriptLoading: 'defer',
        // Minify HTML in production
        minify: isProduction
          ? {
              removeComments: false, // Keep comments to preserve script order
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
          // Copy all the legacy JS files
          { from: '*.js', to: '[name][ext]', globOptions: { ignore: ['webpack.config.js'] } },
          // Copy CSS files if any
          { from: '*.css', to: '[name][ext]', noErrorOnMissing: true },
          // Copy sound files for legacy code
          { from: 'sound', to: 'sound' },
          // Copy game-loader.js from src directory
          { from: 'src/game-loader.js', to: 'game-loader.js' },
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

  // Production-specific configuration
  if (isProduction) {
    // Use chunking and content hashing for bundle files
    config.output.filename = '[name].[contenthash].js';
    config.output.chunkFilename = '[name].[contenthash].js';

    // Update HtmlWebpackPlugin settings for production
    config.plugins = config.plugins.map(plugin => {
      if (plugin instanceof HtmlWebpackPlugin) {
        return new HtmlWebpackPlugin({
          template: './index.html',
          filename: 'index.html',
          inject: 'body', // Inject scripts at end of body
          scriptLoading: 'defer', // Use defer for better loading order
          minify: isProduction
            ? {
                removeComments: false, // Keep comments to preserve script order
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: false,
                removeScriptTypeAttributes: false,
                removeStyleLinkTypeAttributes: false,
              }
            : false,
        });
      }
      return plugin;
    });

    // Add optimization settings
    config.optimization = {
      minimize: true,
      minimizer: [
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
      ],
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
          // Create a separate chunk for vendor code
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Extract vendor name from module path
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
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

    // Generate external source maps for production debugging
    config.devtool = 'source-map';
  } else {
    // Development-specific configuration
    config.output.filename = '[name].bundle.js';
    // Ensure chunks have consistent naming in development
    config.output.chunkFilename = '[name].bundle.js';

    // Make HtmlWebpackPlugin inject the bundle scripts in development mode
    config.plugins = config.plugins.map(plugin => {
      if (plugin instanceof HtmlWebpackPlugin) {
        return new HtmlWebpackPlugin({
          template: './index.html',
          filename: 'index.html',
          inject: 'body', // Inject scripts at end of body
          scriptLoading: 'defer', // Use defer for better loading order
          minify: false,
        });
      }
      return plugin;
    });

    // Add dev server settings
    config.devServer = {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: true,
      devMiddleware: {
        publicPath: '/',
        writeToDisk: true,
      },
    };

    // Use detailed source maps for better debugging
    config.devtool = 'eval-source-map';

    // Add optimization for development
    config.optimization = {
      runtimeChunk: 'single', // Use 'single' instead of naming it to ensure consistent naming
      // Development-focused code splitting
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true, // Force creation of this chunk
          },
        },
      },
    };
  }

  return config;
};
