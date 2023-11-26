module.exports = function override(config, env) {
  // eslint-disable-next-line no-param-reassign
  config.resolve.fallback = {
    fs: false,
    path: false,
  };
  config.module.rules[0].oneOf.splice(2, 0, {
    test: /\.less$/i,
    exclude: /\.module\.(less)$/,
    use: [
      { loader: 'style-loader' },
      { loader: 'css-loader' },
      {
        loader: 'less-loader',
        options: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    ],
  });
  return config;
};
