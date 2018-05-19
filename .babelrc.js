module.exports = (api) => {
  api.cache.never();

  const client = process.env.BABEL_ENV === 'client';

  return {
    presets: [
      ['@babel/preset-env', {
        targets: client
          ? { browsers: 'last 2 versions' }
          : { node: '8.9' },
        shippedProposals: true,
      }],
    ],
  };
};
