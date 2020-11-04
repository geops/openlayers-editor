const webpack = require('webpack');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');
const webpackConfig = require('../../webpack.config');

// const Neutrino = require('neutrino/Neutrino');

module.exports = (on) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  // const options = webpackPreprocessor.defaultOptions;
  // const olProvider = new webpack.ProvidePlugin({ ol: 'openlayers' });
  // options.webpackOptions.plugins = [olProvider];

  const options = {
    // send in the options from your webpack.config.js, so it works the same
    // as your app's code
    webpackOptions: webpackConfig,
    watchOptions: {},
  };

  on('file:preprocessor', webpackPreprocessor(options));
};
