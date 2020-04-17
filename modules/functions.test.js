const { createWith } = require( './creational.js' );
const { ap, curry, compose, pipe, isObject, isNumber, isString, ensureArray, True, False, I, isError } = require( './functions.js' );
const { assert } = require( 'chai' );

describe( 'True', function() {
  it( 'always returns true', () => {
    assert.isTrue( True());
    assert.isTrue( True( null ));
    assert.isTrue( True( 1 ));
    assert.isTrue( True( '' ));
    assert.isTrue( True( 'asdf' ));
    assert.isTrue( True({}));
    assert.isTrue( True([]));
    assert.isTrue( True( false ));
    assert.isTrue( True( true ));
  });
});

describe( 'False', function() {
  it( 'always returns true', () => {
    assert.isFalse( False());
    assert.isFalse( False( null ));
    assert.isFalse( False( 1 ));
    assert.isFalse( False( '' ));
    assert.isFalse( False( 'asdf' ));
    assert.isFalse( False({}));
    assert.isFalse( False([]));
    assert.isFalse( False( false ));
    assert.isFalse( False( true ));
  });
});

describe( 'I', function() {
  it( 'always returns the same value passed', () => {
    assert.equal( I());
    assert.equal( I( null ), null );
    assert.equal( I( 1 ), 1 );
    assert.equal( I( '' ), '' );
    assert.equal( I( 'asdf' ), 'asdf' );
    assert.equal( I( false ), false );
    assert.equal( I( true ), true );
    assert.deepEqual( I({}), {});
    assert.deepEqual( I([]), []);
  });
});

describe( 'isError', function() {
  it( 'returns true if the param passed is instance of errro', () => {
    class X extends Error {}
    const Y = createWith( Error.prototype );
    assert.isTrue( isError( new Error()));
    assert.isTrue( isError( new X()));
    assert.isTrue( isError( Y ));
  });
  it( 'returns false if the param passed is instance of errro', () => {
    assert.isFalse( isError());
    assert.isFalse( isError( 1 ));
    assert.isFalse( isError( '' ));
    assert.isFalse( isError( true ));
    assert.isFalse( isError( null ));
    assert.isFalse( isError({}));
    assert.isFalse( isError([]));
  });
});

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
  it( 'works with an arity predefined', () => {
    const theFn = ( a,b,c ) => ({ a,b,c });
    const fn = curry( theFn, 2 );
    const result = fn( 1 );
    assert.deepEqual( result( 3 ), { a:1,b:undefined,c:3 });
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

describe( 'ap', function() {
  it( 'applies value to a list of funciones', () => {
    const fnList = ap([
      n => n + 2,
      n => n * 3 
    ]);
    const result = fnList( 4 );
    assert.deepEqual( result, [ 6, 12 ]);
  });
  it( 'applies multiples value to a list of funciones', () => {
    const fnList = ap([
      ( n, m ) => n + m + 2,
      ( n, m ) => n + m * 3,
      ( n ) => n * 3 
    ]);
    const result = fnList( 1, 2 );
    assert.deepEqual( result, [ 5, 7, 3 ]);
  });
});

describe( 'isObject', function() {
  it( 'returns true if is plain object', () => {
    assert.isTrue( isObject({}));
  });
  it( 'returns true if is object with functions', () => {
    assert.isTrue( isObject({ a:() => {} }));
  });
  it( 'returns false if is array', () => {
    assert.isFalse( isObject([]));
  });
  it( 'returns false if Date', () => {
    assert.isFalse( isObject( new Date()));
  });
  it( 'returns false if Class Instance', () => {
    const c = class x{};
    const cInstance = new c();
    assert.isFalse( isObject( cInstance ));
  });
});

describe( 'isNumber', function() {
  it( 'returns true when number', () => {
    assert.isTrue( isNumber( 1 ));
    assert.isTrue( isNumber( 1.1 ));
    assert.isTrue( isNumber( 0.2 ));
    assert.isTrue( isNumber( 10e6 ));
  });
  it( 'returns false when is not a number', () => {
    assert.isFalse( isNumber( 10n ));
    assert.isFalse( isNumber( undefined ));
    assert.isFalse( isNumber( null ));
    assert.isFalse( isNumber({}));
    assert.isFalse( isNumber([]));
    assert.isFalse( isNumber( '3' ));
  });
});

describe( 'isString', function() {
  it( 'returns true when string', () => {
    assert.isTrue( isString( '1' ));
    assert.isTrue( isString( 'asdf' ));
  });
  it( 'returns false when is not a string', () => {
    assert.isFalse( isString( 3 ));
    assert.isFalse( isString( 10n ));
    assert.isFalse( isString( undefined ));
    assert.isFalse( isString( null ));
    assert.isFalse( isString({}));
    assert.isFalse( isString([]));
  });
});

describe( 'ensureArray', function() {
  it( 'returns an array with the value passed as param if is not array', () => {
    assert.deepEqual([3],ensureArray( 3 ));
    assert.deepEqual([10n],ensureArray( 10n ));
    assert.deepEqual([undefined],ensureArray( undefined ));
    assert.deepEqual([null],ensureArray( null ));
    assert.deepEqual([{}],ensureArray({}));
    assert.deepEqual(['1'],ensureArray( '1' ));
    assert.deepEqual(['asdf'],ensureArray( 'asdf' ));
  });
  it( 'returns the same value if array passed', () => {
    assert.deepEqual([3],ensureArray([3]));
    assert.deepEqual([10n],ensureArray([10n]));
    assert.deepEqual([undefined],ensureArray([undefined]));
    assert.deepEqual([null],ensureArray([null]));
    assert.deepEqual([{}],ensureArray([{}]));
    assert.deepEqual(['1'],ensureArray(['1']));
    assert.deepEqual(['asdf'],ensureArray(['asdf']));
  });
});