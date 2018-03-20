const webpack = require("webpack");
const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const imageLoader = require('@neutrinojs/image-loader');
const styleLoader = require('@neutrinojs/style-loader');

const { Neutrino } = require('neutrino');

module.exports = on => {
  const options = webpackPreprocessor.defaultOptions;
  const olProvider = new webpack.ProvidePlugin({ ol: "openlayers" });
  options.webpackOptions.plugins = [olProvider];

  const neutrino = Neutrino();
  neutrino.use(imageLoader);
  neutrino.use(styleLoader, { extract: false });
  const config = neutrino.config.toConfig();
  options.webpackOptions.module.rules.push(...config.module.rules);
  on("file:preprocessor", webpackPreprocessor(options));
};
