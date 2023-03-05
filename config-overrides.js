module.exports = function override(config, env) {
  // eslint-disable-next-line no-param-reassign
  console.log('Its working');
  config.resolve.fallback = {
    fs: false,
    path: false,
  };
  return config;
};
