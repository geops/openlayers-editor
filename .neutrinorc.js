const cypress = require('cypress');
const { start } = require('neutrino');
const airbnb = require('@neutrinojs/airbnb-base');
const library = require('@neutrinojs/library');
const imageLoader = require('@constgen/neutrino-svg-loader');
const styleLoader = require('@neutrinojs/style-loader');

// module.exports = neutrino => {
//   neutrino.use([
//     library({
//       name: 'ole',
//       babel: {
//         presets: [
//           ['babel-preset-env', {
//             targets: {
//               browsers: ["last 2 versions", "ie >= 10"]
//             }
//           }]
//         ],
//         plugins: [
//           'transform-es2015-destructuring',
//           'transform-object-assign',
//           'transform-object-rest-spread',
//         ]
//       }
//     }),
//     airbnb({
//       eslint: {
//         rules: {
//           'class-methods-use-this': 'off'
//         }
//       },
//     }),
//     imageLoader(),
//     styleLoader(),
//     devServer(),
//   ])
//   neutrino.config.externals(['jsts', 'ol']);

//   neutrino.on('test', () => new Promise((resolve, reject) =>
//     start(neutrino.config.toConfig(), neutrino).fork(
//       errors => errors.forEach(err => console.error(err)),
//       compiler => cypress.run().then(() => resolve()).catch(() => reject())
//     )
//   ));
// };

module.exports = {
  options: {
    root: __dirname,
  },
  use: [
    airbnb({
      eslint: {
        baseConfig: {
          extends: ['prettier'],
          plugins: ['prettier'],
        },
      },
    }),
    imageLoader(),
  ],
  externals: ['jsts', 'ol'],
};

