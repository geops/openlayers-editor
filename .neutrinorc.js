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
      babel: {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: [
                  '>0.2%',
                  'not dead',
                  'not op_mini all',
                  'not ie <= 11',
                  'not android < 5',
                ],
              },
            },
          ],
        ],
        plugins: [
          '@babel/plugin-transform-destructuring',
          '@babel/plugin-transform-object-assign',
          '@babel/plugin-proposal-object-rest-spread',
        ],
      },
    }),
    imageLoader(),
    styleLoader({ extract: false }),
    (neutrino) => {
      neutrino.config.externals(['jsts', 'ol']);
    },
  ],
};
