/**
 * Copyright (c) 2020 Bytedance Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { version, name, moduleName, dependencies } = require('../package.json');
const browserExternals = require('./browserExternals');
const { babel } = require('@rollup/plugin-babel');
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const alias = require('@rollup/plugin-alias');
const { terser } = require('rollup-plugin-terser');
const externalGlobals = require('rollup-plugin-external-globals');
const extensions = ['.js', '.ts'];

const banner = `/*!
* ${name} v${version}
*
* Copyright (c) 2020 Bytedance Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/`;
const DEV = 'development';
const PROD = 'production';

const resolveFile = function (filePath) {
  return path.join(__dirname, '..', filePath);
};

const builds = {
  'web-cjs-dev': {
    output: {
      file: resolveFile('dist/index.cjs.js'),
      format: 'cjs',
    },
    external: Object.keys(dependencies),
    env: DEV,
  },
  'web-esm-dev': {
    output: {
      file: resolveFile('dist/index.esm.js'),
      format: 'esm',
    },
    external: Object.keys(dependencies),
    env: DEV,
  },
  'web-esm-prod': {
    output: {
      file: resolveFile('dist/index.esm.min.js'),
      format: 'esm',
    },
    external: Object.keys(dependencies),
    plugins: [terser()],
    env: PROD,
  },
  'web-esm-browser-dev': {
    output: {
      file: resolveFile('dist/index.esm.browser.js'),
      format: 'esm',
    },
    external: Object.keys(browserExternals),
    plugins: [externalGlobals(browserExternals)],
    env: DEV,
  },
  'web-esm-browser-prod': {
    output: {
      file: resolveFile('dist/index.esm.browser.min.js'),
      format: 'esm',
    },
    external: Object.keys(browserExternals),
    plugins: [externalGlobals(browserExternals), terser()],
    env: PROD,
  },
  'web-umd-dev': {
    input: resolveFile('src/umdWrapper.ts'),
    output: {
      file: resolveFile('dist/index.umd.js'),
      format: 'umd',
    },
    external: Object.keys(browserExternals),
    env: DEV,
  },
  'web-umd-prod': {
    input: resolveFile('src/umdWrapper.ts'),
    output: {
      file: resolveFile('dist/index.umd.min.js'),
      format: 'umd',
    },
    external: Object.keys(browserExternals),
    plugins: [terser()],
    env: PROD,
  },
  'web-system-dev': {
    output: {
      file: resolveFile('dist/index.system.js'),
      name: null,
      format: 'system',
    },
    external: Object.keys(browserExternals),
    plugins: [externalGlobals(browserExternals)],
    env: DEV,
  },
  'web-system-prod': {
    output: {
      file: resolveFile('dist/index.system.min.js'),
      name: null,
      format: 'system',
    },
    external: Object.keys(browserExternals),
    plugins: [externalGlobals(browserExternals), terser()],
    env: PROD,
  },
};

function genConfig(name) {
  const opts = builds[name];
  const config = {
    ...opts,
    cache: true,
    input: opts.input || resolveFile('src/index.ts'),
    output: {
      name: moduleName,
      globals: browserExternals,
      ...opts.output,
      sourcemap: opts.env === DEV,
      banner,
    },
    plugins: [
      nodeResolve({ extensions }),
      commonjs(),
      babel({
        extensions,
        exclude: 'node_modules/**',
        babelHelpers: 'runtime',
      }),
      alias({
        resolve: extensions,
        entries: [
          {
            find: '@',
            replacement: path.resolve(__dirname, '../src'),
          },
        ],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(opts.env),
      }),
    ].concat(opts.plugins || []),
  };
  return config;
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET);
} else {
  exports.getBuild = genConfig;
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
}
