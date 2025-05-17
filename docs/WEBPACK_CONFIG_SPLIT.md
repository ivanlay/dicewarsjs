# Webpack Configuration Split

The original `webpack.config.js` combined settings for development and production along with legacy scripts. To support ES6 modules while maintaining backwards compatibility, the configuration has been separated into three files:

- `webpack.common.js` – shared settings used by both builds
- `webpack.modern.js` – outputs native ES modules
- `webpack.legacy.js` – bundles legacy scripts with classic script tags

This split keeps legacy support isolated while allowing the modern build to use advanced features like `output.module`. Pass `--config` when running webpack to choose the desired build.
