const cypress = require('cypress');
const { start } = require('neutrino');
const airbnb = require('@neutrinojs/airbnb-base');
const library = require('@neutrinojs/library');
const imageLoader = require('@neutrinojs/image-loader');
const styleLoader = require('@neutrinojs/style-loader');
const devServer = require('@neutrinojs/dev-server');

module.exports = neutrino => {
  neutrino.use(airbnb, { eslint: { globals: ['jsts', 'ol'] } });
  neutrino.use(library, {
    name: 'ole',
    babel: {
      presets: [
        ['babel-preset-env', {
          targets: {
            browsers: ["last 2 versions", "ie >= 10"]
          }
        }]
      ]
    }
  });
  neutrino.use(imageLoader);
  neutrino.use(styleLoader, { extract: false });
  neutrino.use(devServer);

  // neutrino.config.plugins.delete('babel-minify').end();
  // neutrino.config.externals(['jsts']);

  neutrino.on('test', () => new Promise((resolve, reject) =>
    start(neutrino.config.toConfig(), neutrino).fork(
      errors => errors.forEach(err => console.error(err)),
      compiler => cypress.run().then(() => resolve()).catch(() => reject())
    )
  ));
};
