const webpack = require("webpack");
const webpackPreprocessor = require("@cypress/webpack-preprocessor");

const { Neutrino } = require('neutrino');

module.exports = on => {
  const options = webpackPreprocessor.defaultOptions;
  const olProvider = new webpack.ProvidePlugin({ ol: "openlayers" });
  options.webpackOptions.plugins = [olProvider];

  const config = Neutrino().use('.neutrinorc.js').config.toConfig();
  options.webpackOptions.module.rules.push(...config.module.rules);
  on("file:preprocessor", webpackPreprocessor(options));
};
