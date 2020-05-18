const { range, push, unshift, seek } = require( './arrays.js' );
const { assert } = require( 'chai' );

describe( 'arrays.js', function() {
  describe( 'push', function() {
    it( 'pushes the value into an array and return the array', () => 
      assert.deepEqual( push( 3, [ 1,2 ]) , [ 1,2,3 ]));
    it( 'Curried pushes the value into an array and return the array', () => {
      const fn = push( 3 );
      assert.deepEqual( fn([ 1,2 ]) , [ 1,2,3 ]);
    });
  });
  describe( 'unshift', function() {
    it( 'unshifts the value into an array and return the array', () => 
      assert.deepEqual( unshift( 1, [ 2,3 ]) , [ 1,2,3 ]));
    it( 'Curried unshifts the value into an array and return the array', () => {
      const fn = unshift( 1 );
      assert.deepEqual( fn([ 2,3 ]) , [ 1,2,3 ]);
    });
  });
  
  describe( 'range', function() {
    it( 'creates an array of integers from 0 to the number passed', () => {
      assert.deepEqual( range( 10 ), [ 0,1,2,3,4,5,6,7,8,9 ]);
    });
    it( 'creates an array of integers from start to end', () => {
      assert.deepEqual( range( 10, 20 ), [ 10,11,12,13,14,15,16,17,18,19 ]);
    });
  });
  
  describe( 'seek', function() {
    it( 'finds an item in an array appliying a predicate, and returns the result of such apply over found item', () => {
      const arr = [ 2, 4 ];
      const result = seek( x => x % 2, arr );
      assert.isUndefined( result );
    });
    it( 'finds an item in an array appliying a predicate, and returns the result of such apply over found item', () => {
      const arr = [ 2, 4, 3 ];
      const result = seek( x => x % 2, arr );
      assert.equal( result, 1 );
    });
  });
});