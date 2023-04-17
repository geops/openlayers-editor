const cypress = require('cypress');
const { start } = require('neutrino');
const library = require('@neutrinojs/library');
const imageLoader = require('@constgen/neutrino-svg-loader');
const styleLoader = require('@neutrinojs/style-loader');

module.exports = {
  options: {
    root: __dirname,
  },
  use: [
    library({
      name: 'ole',
    }),
    imageLoader(),
    styleLoader({ extract: false }),
    (neutrino) => {
      neutrino.config.externals(['jsts', 'ol']);
    },
  ],
};
