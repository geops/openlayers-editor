module.exports = {
  use: [
    [
      '@neutrinojs/airbnb-base',
      {
        eslint: {
          globals: ['ol'],
        },
      },
    ],
    [
      '@neutrinojs/library',
      {
        name: 'ole',
      },
    ],
    '@neutrinojs/image-minify',
    '@neutrinojs/image-loader',
    ['@neutrinojs/style-loader', {extract: false} ],
    '@neutrinojs/jest',
    '@neutrinojs/dev-server'
  ],
};
