const WebpackCommonConfig = require('./webpack.common');
const WebpackMerge = require('webpack-merge');

module.exports = WebpackMerge(WebpackCommonConfig, {
  mode: "development",
  output: {
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      }
    ]
  }
});
