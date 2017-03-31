/* global require, module, __dirname */

const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: './src/main.js',

  output: {
    filename: 'ole.js',
    sourceMapFilename: 'ole.map',
    publicPath: 'dist',
    path: path.resolve(__dirname, 'dist')
  },


  devServer: {
    compress: true,
    port: 8080
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    })
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  }
};
