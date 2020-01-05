const { curry, compose, pipe } = require( '../index' );
const { assert } = require( 'chai' );

describe('curry', function() {
  it('calls the original method if all the parameters are passed', () => {
    const theFn = (a,b,c) => ({a,b,c});
    const fn = curry(theFn);
    const result = fn(1,2,3); //?
    assert.deepEqual(result, {a:1,b:2,c:3});
  });
  it('calls the original method if all the parameters are passed or the params have default values', () => {
    const theFn = (a,b,c=3) => ({a,b,c});
    const fn = curry(theFn);
    const result = fn(1,2); //?
    const theFn2 = (a,b=2,c=3) => ({a,b,c});
    const fn2 = curry(theFn2);
    const result2 = fn2(1); //?
    assert.deepEqual(result, {a:1,b:2,c:3});
    assert.deepEqual(result2, {a:1,b:2,c:3});
  });
  it('return a function when called with two params applied', () => {
    const theFn = (a,b,c) => ({a,b,c});
    const fn = curry(theFn);
    const fn2 = fn(1,2);
    assert.isFunction(fn2);
    const result = fn2(3);
    assert.deepEqual(result, {a:1,b:2,c:3});
  });
  it('return a function when called with one param applied', () => {
    const theFn = (a,b,c) => ({a,b,c});
    const fn = curry(theFn);
    const fn2 = fn(1);
    assert.isFunction(fn2);
    const result = fn2(2,3);
    assert.deepEqual(result, {a:1,b:2,c:3});
  });
  it('return a function when called with no param applied', () => {
    const theFn = (a,b,c) => ({a,b,c});
    const fn = curry(theFn);
    const fn2 = fn();
    assert.isFunction(fn2);
    const result = fn2(1,2,3);
    assert.deepEqual(result, {a:1,b:2,c:3});
  });
  it('return a function when in different times', () => {
    const theFn = (a,b,c) => ({a,b,c});
    const fn = curry(theFn);
    const fn2 = fn(1);
    assert.isFunction(fn2);
    const fn3 = fn2(2);
    assert.isFunction(fn3);
    const result = fn3(3);
    assert.deepEqual(result, {a:1,b:2,c:3});
  });
  it('works ok if more than the defined params are passed', () => {
    const theFn = (a,b,c) => ({a,b,c});
    const fn = curry(theFn);
    const result = fn(1,2,3,4,5);
    assert.deepEqual(result, {a:1,b:2,c:3});
  });
});

describe('compose', () => {
  it('call all the functions passed as array cascading results', () => {
    const f1 = x=>x*2;
    const f2 = x=>x+10;
    const comp = compose(f1,f2);
    assert.equal(40, comp(10));
  });
})

describe('pipe', () => {
  it('call all the functions passed as array cascading results', () => {
    const f1 = x=>x*2;
    const f2 = x=>x+10;
    const comp = pipe(f1,f2);
    assert.equal(30, comp(10));
  });
})