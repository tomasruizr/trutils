const { curry, compose, pipe, deepFindKey, deepGet, deepSet, rangeN, merge, mergeCopy, ifElse } = require( './fp.js' );
const { assert } = require( 'chai' );

describe( 'curry', function() {
  it( 'calls the original method if all the parameters are passed', () => {
    const theFn = ( a,b,c ) => ({ a,b,c });
    const fn = curry( theFn );
    const result = fn( 1,2,3 ); //?
    assert.deepEqual( result, { a:1,b:2,c:3 });
  });
  it( 'calls the original method if all the parameters are passed or the params have default values', () => {
    const theFn = ( a,b,c = 3 ) => ({ a,b,c });
    const fn = curry( theFn );
    const result = fn( 1,2 ); //?
    const theFn2 = ( a,b = 2,c = 3 ) => ({ a,b,c });
    const fn2 = curry( theFn2 );
    const result2 = fn2( 1 ); //?
    assert.deepEqual( result, { a:1,b:2,c:3 });
    assert.deepEqual( result2, { a:1,b:2,c:3 });
  });
  it( 'return a function when called with two params applied', () => {
    const theFn = ( a,b,c ) => ({ a,b,c });
    const fn = curry( theFn );
    const fn2 = fn( 1,2 );
    assert.isFunction( fn2 );
    const result = fn2( 3 );
    assert.deepEqual( result, { a:1,b:2,c:3 });
  });
  it( 'return a function when called with one param applied', () => {
    const theFn = ( a,b,c ) => ({ a,b,c });
    const fn = curry( theFn );
    const fn2 = fn( 1 );
    assert.isFunction( fn2 );
    const result = fn2( 2,3 );
    assert.deepEqual( result, { a:1,b:2,c:3 });
  });
  it( 'return a function when called with no param applied', () => {
    const theFn = ( a,b,c ) => ({ a,b,c });
    const fn = curry( theFn );
    const fn2 = fn();
    assert.isFunction( fn2 );
    const result = fn2( 1,2,3 );
    assert.deepEqual( result, { a:1,b:2,c:3 });
  });
  it( 'return a function when in different times', () => {
    const theFn = ( a,b,c ) => ({ a,b,c });
    const fn = curry( theFn );
    const fn2 = fn( 1 );
    assert.isFunction( fn2 );
    const fn3 = fn2( 2 );
    assert.isFunction( fn3 );
    const result = fn3( 3 );
    assert.deepEqual( result, { a:1,b:2,c:3 });
  });
  it( 'works ok if more than the defined params are passed', () => {
    const theFn = ( a,b,c ) => ({ a,b,c });
    const fn = curry( theFn );
    const result = fn( 1,2,3,4,5 );
    assert.deepEqual( result, { a:1,b:2,c:3 });
  });
});

describe( 'compose', () => {
  it( 'call all the functions passed as array cascading results', () => {
    const f1 = x=>x * 2;
    const f2 = x=>x + 10;
    const comp = compose( f1,f2 );
    assert.equal( 40, comp( 10 ));
  });
});

describe( 'pipe', () => {
  it( 'call all the functions passed as array cascading results', () => {
    const f1 = x=>x * 2;
    const f2 = x=>x + 10;
    const comp = pipe( f1,f2 );
    assert.equal( 30, comp( 10 ));
  });
});

describe( 'deepFindKey', function() {
  let obj = {
    arr: [{
      data1: 1,
      data2: 2,
      arr2: [ 'a','b','c' ]
    },{
      data3: 3,
      data4: 4
    }
    ],
    a: 'nivel 1',
    b: {
      c: 'nivel 2',
      d: {
        e: 'nivel 3',
        f: {
          g: 'nivel 4'
        }
      }
    }
  };
  it( 'accepts curring', () => {
    const res = deepFindKey( 'a' );
    assert.isFunction( res );
    const result = res( obj );
    assert.equal( result, 'nivel 1' );
  });
  it( 'gets an element at root level', function() {
    const res = deepFindKey( 'a', obj );
    assert.equal( res, 'nivel 1' );
  });
  it( 'gets an element at a nested level', () => {
    const res = deepFindKey( 'c', obj );
    assert.equal( res, 'nivel 2' );
  });
  it( 'gets an element at three nested level', () => {
    const res = deepFindKey( 'g', obj );
    assert.equal( res, 'nivel 4' );
  });
  it( 'gets an element at three nested array', () => {
    const res = deepFindKey( 'data3', obj );
    assert.equal( res, '3' );
  });
});

describe( 'deepGet', function() {
  const obj = {
    a:{
      b:{
        c:'hello'
      }
    }
  };
  it( 'calls mGet when all the params are passed', () => {
    const result = deepGet( 'a.b.c', obj );
    assert.equal( result, 'hello' );
  });
  it( 'Accepts curried params', () => {
    const res = deepGet( 'a.b.c' );
    assert.isFunction( res );
    const result = res( obj );
    assert.equal( result, 'hello' );
  });
});
describe( 'deepSet', function() {
  const obj = {
    a:{
      b:{
        c:'hello'
      }
    }
  };
  it( 'calls mSet when all the params are passed', () => {
    deepSet( 'a.b.d', 4, obj );
    assert.deepEqual({ a:{ b:{ c:'hello', d:4 }}}, obj );
  });
  it( 'Accepts curried params', () => {
    const res = deepSet( 'a.b.d', 5 );
    assert.isFunction( res );
    res( obj );
    assert.deepEqual({ a:{ b:{ c:'hello', d:5 }}}, obj );
  });
});

describe( 'rangeN', function() {
  it( 'creates an array of integers from 0 to the number passed', () => {
    assert.deepEqual( rangeN( 10 ), [ 0,1,2,3,4,5,6,7,8,9 ]);
  });
});


describe( 'mergeCopy', function() {
  it( 'generates a curried function when no source supplied', () => {
    const m = mergeCopy({ a:'tomas' });
    const result = m({ b:'ruiz' });
    assert.deepEqual( result, { a:'tomas', b:'ruiz' });
  });
  it( 'deleting works', () => {
    const state = { prop: true, other: true, deep: { prop: 'foo' }};
    const newState = mergeCopy({
      prop: undefined,
      deep: { prop: undefined },
      fake: undefined, // deleting non existent key
      other: null
    }, state );
    assert.deepEqual( state, { prop: true, other: true, deep: { prop: 'foo' }});
    assert.deepEqual( newState, { other: null, deep: {}});
  });
  it( 'deleting works with arrays', () => {
    const state = { foo: 'bar', deep: { arr: [ 1, 2, 3 ], prop: false }};
    const newState = mergeCopy({ deep: { arr: { 1: undefined }}}, state );
    assert.notEqual( state.deep, newState.deep );
    assert.notEqual( state.deep.arr, newState.deep.arr );
    assert.deepEqual( newState.deep.arr, [ 1, 3 ]);
  });
  it( 'function sub works', () => {
    const state = { age: 10, name: 'bob', obj: { prop: true }};
    const newState = mergeCopy({
      age: x => x * 10,
      obj: () => ({ replaced: true }),
      name: ( x, m ) => {
        assert.equal( m, mergeCopy ); // verify that merge is passed as second arg
        return x;
      }
    }, state );
    assert.deepEqual( newState, { age: 100, name: 'bob', obj: { replaced: true }});
    assert.deepEqual( state, { age: 10, name: 'bob', obj: { prop: true }});
  });
  it( 'deep function sub to uncreated object path', () => {
    const state = { orig: true };
    const newState = mergeCopy({
      add: { stats: { count: x => ( x == null ? 1 : x + 1 ) }}
    }, state );
    assert.deepEqual( newState, { orig: true, add: { stats: { count: 1 }}});
    assert.deepEqual( state, { orig: true });
  });
  it( 'add nested object', () => {
    const state = { age: 10 };
    const add = { sub: true };
    const newState = mergeCopy({ add }, state );
    assert.deepEqual( newState, { age: 10, add: { sub: true }});
    assert.notEqual( newState.add, add );
    assert.notEqual( state, newState );
  });
  it( 'deep merge objects', () => {
    const state = { age: 10, sub: { sub: { prop: true }}};
    const newState = mergeCopy({ sub: { sub: { newProp: true }}}, state );
    assert.deepEqual( state, { age: 10, sub: { sub: { prop: true }}});
    assert.deepEqual( newState, { age: 10, sub: { sub: { prop: true, newProp: true }}});
    assert.notEqual( newState, state );
    assert.notEqual( newState.sub, state.sub );
    assert.notEqual( newState.sub.sub, state.sub.sub );
  });
  it( 'function patch', () => {
    const state = { age: 10, foo: 'bar' };
    const newState = mergeCopy(( s ) => {
      assert.notEqual( s, state );
      assert.deepEqual( s, state );
      return mergeCopy( s, { prop: true });
    }, state );
    assert.deepEqual( newState, { age: 10, foo: 'bar', prop: true });
  });
  it( 'function patch that replaces', () => {
    const state = { age: 10, foo: 'bar' };
    const newState = mergeCopy(( s ) => {
      assert.notEqual( s, state );
      assert.deepEqual( s, state );
      return { name:'tomas' };
    }, state );
    assert.deepEqual( newState, { name:'tomas' });
  });
  it( 'returns original state if patch is no object, array or function', () => {
    const state = { age: 10, foo: 'bar' };
    let newState = mergeCopy( 1, state );
    assert.deepEqual( newState, { age: 10, foo: 'bar' });
    newState = mergeCopy( undefined, state );
    assert.deepEqual( newState, { age: 10, foo: 'bar' });
    newState = mergeCopy( null, state );
    assert.deepEqual( newState, { age: 10, foo: 'bar' });
    //TODO: this should be equal.
    assert.notEqual( state, newState );
  });
  it( 'deep merge with arr', () => {
    const state = { foo: 'bar', deep: { arr: [ 1, 2, 3 ], prop: false }};
    const newState = mergeCopy({ deep: { arr: { 1: 20 }}}, state );
    assert.notEqual( state.deep, newState.deep );
    assert.notEqual( state.deep.arr, newState.deep.arr );
    assert.deepEqual( newState.deep.arr, [ 1, 20, 3 ]);
    assert.deepEqual( state.deep.arr, [ 1, 2, 3 ]);
  });
  it( 'top level SUB', () => {
    const state = { age: 20, foo: 'bar' };
    const replacement = { replaced: true };
    const newState = mergeCopy(() => replacement, state );
    assert.notEqual( state, newState );
    assert.equal( newState, replacement );
  });
  it( 'reuse object if same ref when patching', () => {
    const state = { deep: { prop: true }};
    const newState = mergeCopy({ deep: state.deep }, state );
    assert.notEqual( state, newState ); // TODO: maybe try and be smarter, to avoid copy if patch changes nothing
    assert.equal( newState.deep, state.deep );
  });
  it( 'multi function patch, only copy once', () => {
    const copies = [];
    mergeCopy( Array.from({ length: 5 }, () => state => ( copies.push( state ), state )), { key: 'value' });
    assert.equal( copies.length, 5 );
    assert.equal( typeof copies[0], 'object' );
    copies.every( copy => assert.equal( copy, copies[0]));
  });
  it( 'replace primitive with object and vice versa', () => {
    const state = { count: 10, foo: { prop: true }};
    const newState = mergeCopy({ count: { prop: true }, foo: 10 }, state );
    assert.deepEqual( state, { count: 10, foo: { prop: true }});
    assert.deepEqual( newState, { count: { prop: true }, foo: 10 });
  });
});

describe( 'merge', function() {
  it( 'generates a curried function when no source supplied', () => {
    const m = merge({ a:'tomas' });
    const result = m({ b:'ruiz' });
    assert.deepEqual( result, { a:'tomas', b:'ruiz' });
  });
  it( 'deleting works', () => {
    const state = { prop: true, other: true, deep: { prop: 'foo' }};
    const newState = merge({
      prop: undefined,
      deep: { prop: undefined },
      fake: undefined, // deleting non existent key
      other: null
    }, state );
    assert.equal( newState, state );
    assert.deepEqual( state, { other: null, deep: {}});
  });
  it( 'function sub works', () => {
    const state = { age: 10, name: 'bob', obj: { prop: true }};
    const newState = merge({
      age: x => x * 10,
      obj: () => ({ replaced: true }),
      name: ( x, m ) => {
        assert.equal( m, merge ); // verify that merge is passed as second arg
        return x;
      }
    }, state );
    assert.equal( newState, state );
    assert.deepEqual( state, { age: 100, name: 'bob', obj: { replaced: true }});
    assert.equal( newState, state );
  });
  it( 'deep function sub to uncreated object path', () => {
    const state = { orig: true };
    const newState = merge({
      add: { stats: { count: x => ( x == null ? 1 : x + 1 ) }}
    }, state );
    assert.deepEqual( state, { orig: true, add: { stats: { count: 1 }}});
    assert.equal( newState, state );
  });
  it( 'add nested object', () => {
    const state = { age: 10 };
    const add = { sub: true };
    const newState = merge({ add }, state );
    assert.deepEqual( state, { age: 10, add: { sub: true }});
    assert.notEqual( newState.add, add );
    assert.equal( newState, state );
  });
  it( 'deep merge objects', () => {
    const state = { age: 10, sub: { sub: { prop: true }}};
    const newState = merge({ sub: { sub: { newProp: true }}}, state );
    assert.deepEqual( state, { age: 10, sub: { sub: { prop: true, newProp: true }}});
    assert.equal( newState, state );
    assert.equal( newState.sub, state.sub );
    assert.equal( newState.sub.sub, state.sub.sub );
  });
  it( 'function patch', () => {
    const state = { age: 10, foo: 'bar' };
    merge(( s ) => {
      assert.equal( s, state );
      assert.deepEqual( s, state );
      return merge( s, { prop: true });
    }, state );
  });
  it( 'deep merge with arr', () => {
    const state = { foo: 'bar', deep: { arr: [ 1, 2, 3 ], prop: false }};
    const newState = merge({ deep: { arr: { 1: 20 }}}, state );
    assert.equal( state.deep, newState.deep );
    assert.equal( state.deep.arr, newState.deep.arr );
    assert.deepEqual( state.deep.arr, [ 1, 20, 3 ]);
  });
  it( 'top level SUB', () => {
    const state = { age: 20, foo: 'bar' };
    const replacement = { replaced: true };
    const newState = merge(() => replacement, state );
    assert.notEqual( state, newState );
    assert.equal( newState, replacement );
  });
  it( 'reuse object if same ref when patching', () => {
    const state = { deep: { prop: true }};
    const newState = merge({ deep: state.deep }, state );
    assert.equal( state, newState ); // TODO: maybe try and be smarter, to avoid copy if patch changes nothing
    assert.equal( newState.deep, state.deep );
  });
  it( 'multi function patch, only copy once', () => {
    const copies = [];
    merge( Array.from({ length: 5 }, () => state => ( copies.push( state ), state )), { key: 'value' });
    assert.equal( copies.length, 5 );
    assert.equal( typeof copies[0], 'object' );
    copies.every( copy => assert.equal( copy, copies[0]));
  });
  it( 'replace primitive with object and vice versa', () => {
    const state = { count: 10, foo: { prop: true }};
    merge({ count: { prop: true }, foo: 10 }, state );
    assert.deepEqual( state, { count: { prop: true }, foo: 10 });
  });
});

describe( 'ifElse', function() {
  it( 'handles conditions', ( done ) => {
    ifElse(()=>true, () => done(), ()=>{})( true );
  });
  it( 'handles conditions', ( done ) => {
    ifElse(()=>false, () => {}, ()=>done())();
  });
});