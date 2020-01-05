const t = require( '../index' );
const { assert } = require( 'chai' );
const sinon = require('sinon');
const obj = {
  a:{
    b:{
      c:'hello'
    }
  }
}
describe('deepGet', function() {
  it('calls mGet when all the params are passed', () => {
    const result = t.deepGet('a.b.c', obj);
    assert.equal(result, 'hello');
  });
  it('Accepts curried params', () => {
    const res = t.deepGet('a.b.c');
    assert.isFunction(res);
    const result = res(obj);
    assert.equal(result, 'hello');
  });
});
describe('deepSet', function() {
  it('calls mSet when all the params are passed', () => {
    t.deepSet('a.b.d', 4, obj);
    assert.deepEqual({a:{b:{c:'hello', d:4}}}, obj);
  });
  it('Accepts curried params', () => {
    const res = t.deepSet('a.b.d', 5);
    assert.isFunction(res);
    res(obj);
    assert.deepEqual({a:{b:{c:'hello', d:5}}}, obj);
  });
});