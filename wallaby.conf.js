// eslint-disable-next-line no-unused-vars
module.exports = function ( wallaby ) {
  process.env.NODE_ENV = 'test';
  return {
    files: [
      '*/*.js',
      'modules/*.js',
      { pattern: 'modules/*.test.js', ignore: true },
      { pattern: 'wallaby.conf.js', ignore: true, instrument:false },
    ],
    tests: [
      'modules/*.test.js'
    ],
    env: {
      type: 'node'
    },
    testFramework: 'mocha',

  };
};
