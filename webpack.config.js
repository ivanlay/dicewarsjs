const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
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
      inject: false
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'sound', to: 'sound' },
        // Copy all the legacy JS files
        { from: '*.js', to: '[name][ext]', globOptions: { ignore: ['webpack.config.js'] } },
        // Copy CSS files if any
        { from: '*.css', to: '[name][ext]', noErrorOnMissing: true }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 8080,
    hot: true
  },
  devtool: 'source-map'
};