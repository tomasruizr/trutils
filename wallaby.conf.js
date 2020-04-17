// eslint-disable-next-line no-unused-vars
module.exports = function ( wallaby ) {
  process.env.NODE_ENV = 'test';
  return {
    files: [
      '*/*.js',
      'modules/*.js',
      'modules/types/*.js',
      'test/*.js',
      'index.js',
      { pattern: 'modules/*.test.js', ignore: true },
      { pattern: 'modules/types/*.test.js', ignore: true },
      { pattern: 'test/*.test.js', ignore: true },
      { pattern: 'wallaby.conf.js', ignore: true, instrument:false },
    ],
    tests: [
      'modules/types/*.test.js',
      'modules/*.test.js',
      'test/*.test.js',
    ],
    env: {
      type: 'node'
    },
    testFramework: 'mocha',

  };
};
