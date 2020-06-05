const { noop, True } = require( '../functions.js' );
const Task = require( './Task.js' );
const { assert } = require( 'chai' );

describe( 'Task', function() {
  describe( 'ensureTask', function() {
    it( 'Ensures the value passed is a Task or casts one', () => {
      const t1 = Task.ensureTask( 'hola' );
      t1.fork( noop, data => assert.equal( data, 'hola' ));
      const t2 = Task.ensureTask( Task.of( 'hola' ));
      t2.fork( noop, data => assert.equal( data, 'hola' ));
      const t3 = Task.ensureTask( new Task(( rej, res ) => res( 'hola' )));
      t3.fork( noop, data => assert.equal( data, 'hola' ));
    });
  });
  
  describe( 'ap', function() {
    it( 'rejects if one of the ap functions rejects', () => {
      Task.of( one=>two => `${one}-${two}` )
        .ap( Task.of( 'hola' ))
        .ap( Task.rejected( 'pana' ))
        .fork( err => assert.equal( err, 'pana' ), () => assert( false ));
    });
  });
});