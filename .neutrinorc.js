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
      /* make customizations */
      neutrino.config.externals(['jsts', 'ol']);
    },
    // (neutrino)=> {
    //   neutrino.on('test', () => new Promise((resolve, reject) =>
    //     start(neutrino.config.toConfig(), neutrino).fork(
    //       errors => errors.forEach(err => console.error(err)),
    //       compiler => cypress.run().then(() => resolve()).catch(() => reject())
    //     )
    //   ));
    // }
  ],
};