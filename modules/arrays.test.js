const { range } = require( './arrays.js' );
const { assert } = require( 'chai' );

describe( 'range', function() {
  it( 'creates an array of integers from 0 to the number passed', () => {
    assert.deepEqual( range( 10 ), [ 0,1,2,3,4,5,6,7,8,9 ]);
  });
  it( 'creates an array of integers from start to end', () => {
    assert.deepEqual( range( 10, 20 ), [ 10,11,12,13,14,15,16,17,18,19 ]);
  });
});
