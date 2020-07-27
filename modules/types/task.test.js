const { noop, True } = require( '../functions.js' );
const Task = require( './Task.js' );
const { assert } = require( 'chai' );

describe( 'Task', function() {
  describe( 'ap', function() {
    it( 'rejects if one of the ap functions rejects', () => {
      Task.of( one=>two => `${one}-${two}` )
        .ap( Task.of( 'hola' ))
        .ap( Task.rejected( 'pana' ))
        .fork( err => assert.equal( err, 'pana' ), () => assert( false ));
    });
  });
});