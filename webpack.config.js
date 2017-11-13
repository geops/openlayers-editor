/* global require, module, __dirname */

const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './src/main.js',

  output: {
    filename: 'ole.js',
    publicPath: '/dist/',
    path: path.resolve(__dirname, 'dist')
  },


  devServer: {
    compress: true,
    port: 8080
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        minimize: true
    })
  ],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader?presets[]=es2015',
        exclude: /node_modules(?!\/webpack-dev-server)/,
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'url-loader',
          {
            loader: 'image-webpack-loader',
            query: {
              pngquant: {
                quality: '65-90',
                speed: 4
              }
            }
          }
        ]
      }
    ]
  }
};
