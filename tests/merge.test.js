const { merge, mergeCopy } = require( '../index' );
const assert = require( 'assert' );
describe('mergeCopy', function() {
  it('generates a curried function when no source supplied', () => {
    const m = mergeCopy({a:'tomas'});
    const result = m({b:'ruiz'});
    assert.deepEqual(result, {a:'tomas', b:'ruiz'})
  });
  it('deleting works', () => {
    const state = { prop: true, other: true, deep: { prop: 'foo' } }
    const newState = mergeCopy({
      prop: undefined,
      deep: { prop: undefined },
      fake: undefined, // deleting non existent key
      other: null
    }, state)
    assert.deepEqual(state, { prop: true, other: true, deep: { prop: 'foo' } });
    assert.deepEqual(newState, { other: null, deep: {} });
  })
  it('deleting works with arrays', () => {
    const state = { foo: 'bar', deep: { arr: [1, 2, 3], prop: false } }
    const newState = mergeCopy({ deep: { arr: { 1: undefined } } }, state)
    assert.notEqual(state.deep, newState.deep);
    assert.notEqual(state.deep.arr, newState.deep.arr);
    assert.deepEqual(newState.deep.arr, [1, 3]);
  })
  it('function sub works', () => {
    const state = { age: 10, name: 'bob', obj: { prop: true } }
    const newState = mergeCopy({
      age: x => x * 10,
      obj: () => ({ replaced: true }),
      name: (x, m) => {
        assert.equal(m, mergeCopy) // verify that merge is passed as second arg
        return x
      }
    }, state)
    assert.deepEqual(newState, { age: 100, name: 'bob', obj: { replaced: true } })
    assert.deepEqual(state, { age: 10, name: 'bob', obj: { prop: true } })
  })
  it('deep function sub to uncreated object path', () => {
    const state = { orig: true }
    const newState = mergeCopy({
      add: { stats: { count: x => (x == null ? 1 : x + 1) } }
    }, state)
    assert.deepEqual(newState, { orig: true, add: { stats: { count: 1 } } })
    assert.deepEqual(state, { orig: true })
  })
  it('add nested object', () => {
    const state = { age: 10 }
    const add = { sub: true }
    const newState = mergeCopy({ add }, state)
    assert.deepEqual(newState, { age: 10, add: { sub: true } })
    assert.notEqual(newState.add, add)
    assert.notEqual(state, newState)
  })
  it('deep merge objects', () => {
    const state = { age: 10, sub: { sub: { prop: true } } }
    const newState = mergeCopy({ sub: { sub: { newProp: true } } }, state)
    assert.deepEqual(state, { age: 10, sub: { sub: { prop: true } } })
    assert.deepEqual(newState, { age: 10, sub: { sub: { prop: true, newProp: true } } })
    assert.notEqual(newState, state)
    assert.notEqual(newState.sub, state.sub)
    assert.notEqual(newState.sub.sub, state.sub.sub)
  })
  it('function patch', () => {
    const state = { age: 10, foo: 'bar' }
    const newState = mergeCopy((s, m) => {
      assert.notEqual(s, state)
      assert.deepEqual(s, state)
      return mergeCopy(s, { prop: true })
    }, state)
    assert.deepEqual(newState, { age: 10, foo: 'bar', prop: true })
  })
  it('deep merge with arr', () => {
    const state = { foo: 'bar', deep: { arr: [1, 2, 3], prop: false } }
    const newState = mergeCopy({ deep: { arr: { 1: 20 } } }, state)
    assert.notEqual(state.deep, newState.deep);
    assert.notEqual(state.deep.arr, newState.deep.arr);
    assert.deepEqual(newState.deep.arr, [1, 20, 3]);
    assert.deepEqual(state.deep.arr, [1, 2, 3]);
  })
  it('top level SUB', () => {
    const state = { age: 20, foo: 'bar' }
    const replacement = { replaced: true }
    const newState = mergeCopy(() => replacement, state)
    assert.notEqual(state, newState);
    assert.equal(newState, replacement)
  })
  it('reuse object if same ref when patching', () => {
    const state = { deep: { prop: true } }
    const newState = mergeCopy({ deep: state.deep }, state)
    assert.notEqual(state, newState); // TODO: maybe try and be smarter, to avoid copy if patch changes nothing
    assert.equal(newState.deep, state.deep)
  })
  it('multi function patch, only copy once', () => {
    const copies = []
    mergeCopy(Array.from({ length: 5 }, () => state => (copies.push(state), state)), { key: 'value' });
    assert.equal(copies.length, 5);
    assert.equal(typeof copies[0], 'object');
    copies.every(copy => assert.equal(copy, copies[0]))
  })
  it('replace primitive with object and vice versa', () => {
    const state = { count: 10, foo: { prop: true } }
    const newState = mergeCopy({ count: { prop: true }, foo: 10 }, state)
    assert.deepEqual(state, { count: 10, foo: { prop: true } })
    assert.deepEqual(newState, { count: { prop: true }, foo: 10 })
  })
});

describe('merge', function() {
  it('generates a curried function when no source supplied', () => {
    const m = merge({a:'tomas'});
    const result = m({b:'ruiz'});
    assert.deepEqual(result, {a:'tomas', b:'ruiz'})
  });
  it('deleting works', () => {
    const state = { prop: true, other: true, deep: { prop: 'foo' } }
    const newState = merge({
      prop: undefined,
      deep: { prop: undefined },
      fake: undefined, // deleting non existent key
      other: null
    }, state)
    assert.equal(newState, state);
    assert.deepEqual(state, { other: null, deep: {} });
  })
  it('function sub works', () => {
    const state = { age: 10, name: 'bob', obj: { prop: true } }
    const newState = merge({
      age: x => x * 10,
      obj: () => ({ replaced: true }),
      name: (x, m) => {
        assert.equal(m, merge) // verify that merge is passed as second arg
        return x
      }
    }, state)
    assert.equal(newState, state);
    assert.deepEqual(state, { age: 100, name: 'bob', obj: { replaced: true } })
    assert.equal(newState, state);
  })
  it('deep function sub to uncreated object path', () => {
    const state = { orig: true }
    const newState = merge({
      add: { stats: { count: x => (x == null ? 1 : x + 1) } }
    }, state)
    assert.deepEqual(state, { orig: true, add: { stats: { count: 1 } } })
    assert.equal(newState, state);
  })
  it('add nested object', () => {
    const state = { age: 10 }
    const add = { sub: true }
    const newState = merge({ add }, state)
    assert.deepEqual(state, { age: 10, add: { sub: true } })
    assert.notEqual(newState.add, add)
    assert.equal(newState, state);
  })
  it('deep merge objects', () => {
    const state = { age: 10, sub: { sub: { prop: true } } }
    const newState = merge({ sub: { sub: { newProp: true } } }, state)
    assert.deepEqual(state, { age: 10, sub: { sub: { prop: true, newProp: true } } })
    assert.equal(newState, state);
    assert.equal(newState.sub, state.sub)
    assert.equal(newState.sub.sub, state.sub.sub)
  })
  it('function patch', () => {
    const state = { age: 10, foo: 'bar' }
    const newState = merge((s, m) => {
      assert.equal(s, state);
      assert.deepEqual(s, state)
      return merge(s, { prop: true })
    }, state)
  })
  it('deep merge with arr', () => {
    const state = { foo: 'bar', deep: { arr: [1, 2, 3], prop: false } }
    const newState = merge({ deep: { arr: { 1: 20 } } }, state)
    assert.equal(state.deep, newState.deep);
    assert.equal(state.deep.arr, newState.deep.arr);
    assert.deepEqual(state.deep.arr, [1, 20, 3]);
  })
  it('top level SUB', () => {
    const state = { age: 20, foo: 'bar' }
    const replacement = { replaced: true }
    const newState = merge(() => replacement, state)
    assert.notEqual(state, newState);
    assert.equal(newState, replacement)
  })
  it('reuse object if same ref when patching', () => {
    const state = { deep: { prop: true } }
    const newState = merge({ deep: state.deep }, state)
    assert.equal(state, newState); // TODO: maybe try and be smarter, to avoid copy if patch changes nothing
    assert.equal(newState.deep, state.deep)
  })
  it('multi function patch, only copy once', () => {
    const copies = []
    merge(Array.from({ length: 5 }, () => state => (copies.push(state), state)), { key: 'value' });
    assert.equal(copies.length, 5);
    assert.equal(typeof copies[0], 'object');
    copies.every(copy => assert.equal(copy, copies[0]))
  })
  it('replace primitive with object and vice versa', () => {
    const state = { count: 10, foo: { prop: true } }
    const newState = merge({ count: { prop: true }, foo: 10 }, state)
    assert.deepEqual(state, { count: { prop: true }, foo: 10 })
  })
});