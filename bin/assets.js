const Webpack = require('webpack');
const FS = require('fs');
const Path = require('path');
const Gutil = require('gutil');
const WebpackConfig = require(`../config/webpack/${process.env.NODE_ENV}.js`);

const compiler = Webpack(WebpackConfig);

compiler.watch({
  aggregateTimeout: 3000,
  poll: 1000,
  ignored: /node_modules/
}, (err, stats) => {
  if (err) {
    throw new Gutil.PluginError('webpack:build', err);
  }
  Gutil.log(
    '[webpack:build]',
    stats.toString({
      chunks: false, // Makes the build much quieter
      colors: true
    })
  );
});
