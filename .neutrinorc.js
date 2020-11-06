const cypress = require('cypress');
const { start } = require('neutrino');
const library = require('@neutrinojs/library');
const imageLoader = require('@constgen/neutrino-svg-loader');
const styleLoader = require('@neutrinojs/style-loader');
// 5cc87b12d7c5370001c1d655e96f1d54c5404bbb8cc4cfcd2ff5111b5
// 5cc87b12d7c5370001c1d655352830d2fef24680ae3a1cda54418cb8
module.exports = {
  options: {
    root: __dirname,
  },
  use: [
    library({
      name: 'ole',
      babel: {
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ["last 2 versions", "ie >= 10"]
            }
          }]
        ],
        plugins: [
          '@babel/plugin-transform-destructuring',
          '@babel/plugin-transform-object-assign',
          '@babel/plugin-proposal-object-rest-spread',
        ]
      }
    }),
    imageLoader(),
    styleLoader({ extract: false }),
    (neutrino) => {
      neutrino.config.externals(['jsts', 'ol']);
    },
  ],
};