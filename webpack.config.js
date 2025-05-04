const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/**
 * Webpack configuration with environment-specific settings
 * @param {Object} env - Environment variables
 * @param {Object} argv - CLI arguments including mode
 * @returns {Object} Webpack configuration
 */
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  // Base configuration used for both development and production
  const config = {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        // Don't inject the bundle.js for now - we'll use the legacy script tags
        inject: false,
        // Minify HTML in production
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        } : false
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'sound', to: 'sound' },
          // Copy all the legacy JS files
          { from: '*.js', to: '[name][ext]', globOptions: { ignore: ['webpack.config.js'] } },
          // Copy CSS files if any
          { from: '*.css', to: '[name][ext]', noErrorOnMissing: true }
        ]
      }),
      // Clean the output directory before each build
      new CleanWebpackPlugin()
    ]
  };
  
  // Production-specific configuration
  if (isProduction) {
    // Use chunking and content hashing for bundle files
    config.output.filename = '[name].[contenthash].js';
    config.output.chunkFilename = '[name].[contenthash].js';
    
    // Add optimization settings
    config.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: false, // Keep console logs for now
              passes: 2 // Multiple optimization passes
            },
            mangle: true,
            output: {
              comments: false // Remove comments
            }
          },
          extractComments: false // Don't extract comments to separate file
        })
      ],
      // Enable tree shaking (dead code elimination)
      usedExports: true,
      // Split code into chunks
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          // Create a separate chunk for vendor code
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    };
    
    // No source maps in production for smaller bundle size
    config.devtool = false;
  } else {
    // Development-specific configuration
    config.output.filename = 'bundle.js';
    
    // Add dev server settings
    config.devServer = {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true,
      port: 8080,
      hot: true
    };
    
    // Use source maps for better debugging
    config.devtool = 'source-map';
  }
  
  return config;
};