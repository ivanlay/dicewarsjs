# Webpack Configuration Split

To better support legacy and modern builds, the original single `webpack.config.js` has been replaced by three configuration files:

- **webpack.common.js** – shared settings used by all builds
- **webpack.legacy.js** – generates traditional scripts loaded with `defer`
- **webpack.modern.js** – outputs native ES modules loaded with `type="module"`

Running `npm run dev` starts the modern development server while `npm run dev:legacy` starts the legacy version. Production builds can be generated with `npm run build` and `npm run build:legacy`. Use `npm run build:all` to create both at once.

Hot module replacement (HMR) is disabled in the modern config because webpack does not yet support HMR for module chunk output.
