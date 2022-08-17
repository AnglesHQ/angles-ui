module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
    browser: true,
  },
  extends: [
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2018,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  plugins: [
    'react',
  ],
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id', '_index'] }],
    'no-unused-vars': ['error', { varsIgnorePattern: 'should' }],
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/prop-types': [0, {}],
    'react/no-did-update-set-state': [0, {}],
    'jsx-a11y/click-events-have-key-events': [0, {}],
    'jsx-a11y/no-noninteractive-element-to-interactive-role': [0, {}],
    'jsx-a11y/no-noninteractive-element-interactions': [0, {}],
    'jsx-a11y/no-static-element-interactions': [0, {}],
  },
};
