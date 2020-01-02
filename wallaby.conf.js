// eslint-disable-next-line no-unused-vars
module.exports = function ( wallaby ) {
  process.env.NODE_ENV = 'test';
  return {
    files: [
      '*.js',
      '*.json',
      { pattern: 'tests/*.test.js', ignore: true }
    ],

    tests: [
      'tests/*.test.js'
    ],
    env: {
      type: 'node'
    },
    testFramework: 'mocha',

  };
};
