/* eslint-disable import/no-extraneous-dependencies */
const createDefaultConfig = require('@advanced-rest-client/a11y-suite/default-config.js');
const merge = require('webpack-merge');

module.exports = (config) => {
  config.set(
      merge(createDefaultConfig(config), {
        files: [
        // runs all files ending with .test in the test folder,
        // can be overwritten by passing a --grep flag. examples:
        //
        // npm run test -- --grep test/foo/bar.test.js
        // npm run test -- --grep test/bar/*
          { pattern: config.grep ? config.grep : 'test/**/*.test.js', type: 'module' },
          'node_modules/accessibility-developer-tools/dist/js/axs_testing.js'
        ],

      // you can overwrite/extend the config further
      }),
  );
  return config;
};
