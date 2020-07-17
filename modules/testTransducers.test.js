const { seq, into, map, filter, reduce } = require( './testTransduce.js' );
const { compose } = require( './functions.js' );
const { assert } = require( 'chai' );

describe( 'transducers', function() {
  describe( 'seq', function() {
    it( 'accepts curring', () => {
      const arr = [...Array( 10 ).keys()];
      const res = seq(
        compose(
          filter( num => num % 2 === 0 ),
          map( num => num * 10 ),
          map( num => num / 2 ),
        )
      ); //?.$
      assert.isFunction( res );
      const result = res( arr );
      assert.deepEqual( result, [ 0, 10, 20, 30, 40 ]);
    });
    it( 'reduces the operations with functional params order', () => {
      const arr = [...Array( 10 ).keys()];
      const result = seq(
        compose(
          filter( num => num % 2 === 0 ),
          map( num => num * 10 ),
          map( num => num / 2 ),
        ),
        arr
      ); //?.$
      assert.deepEqual( result, [ 0, 10, 20, 30, 40 ]);
    });
  });
  describe( 'reduce', function() {
    it( 'works with a seq, compose', () => {
      const arr = [...Array( 10 ).keys()];
      const result = seq(
        compose(
          filter( num => num % 2 === 0 ),
          map( num => num * 10 ),
          map( num => num / 2 ),
          reduce(( accumulate, current ) => accumulate + current, 0 ),
        ),
        arr
      ); //?.$
      assert.equal( result, 100 );
    });
  });
  describe( 'into', function() {
    it( 'accepts curring', () => {
      const arr = [...Array( 10 ).keys()];
      const res = into([], compose(
        filter( num => num % 2 === 0 ),
        map( num => num * 10 ),
        map( num => num / 2 ),
      ));
      assert.isFunction( res );
      const result = res( arr );
      assert.deepEqual( result, [ 0, 10, 20, 30, 40 ]);
    });
    it( 'reduces the operations with functional params order', () => {
      const arr = [...Array( 10 ).keys()];
      const result = into([],
        compose(
          filter( num => num % 2 === 0 ),
          map( num => num * 10 ),
          map( num => num / 2 ),
        ),
        arr
      ); //?.$
      assert.deepEqual( result, [ 0, 10, 20, 30, 40 ]);
    });
  });
  describe( 'creation of on the spot transducer', function() {
    it( 'makes use of an on-the-spot creation', () => {
      const nth = ( iteration, init = 0 ) => reducer => ({
        result: reducer['@@transducer/result'],
        step: ( acc, curr ) => ++init < iteration ? reducer( acc, curr ) : acc
      });
      const arr = [...Array( 10 ).keys()];
      const result = into([],
        compose(
          filter( num => num % 2 === 0 ),
          map( num => num * 10 ),
          map( num => num / 2 ),
          // nth( 3 )
        ),
        arr
      ); //?.$
      assert.deepEqual( result, [ 0, 10, 20 ]);
    });
  });
});