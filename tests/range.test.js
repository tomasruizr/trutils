const t = require('../index.js');
const {assert} = require('chai');
describe('range', function() {
  it('creates an array of integers from 0 to the number passed', () => {
    assert.deepEqual(t.range(10), [0,1,2,3,4,5,6,7,8,9]);
  });
});