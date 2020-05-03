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
  
  // describe( 'fromOptions', function() {
  //   it.skip( 'returns a left in case condition is not true', () => {
  //     const x = Task.fromOptions([
  //       [ ( str ) => /algo/.test( str ), str=> `la cadena tiene algo, ${str}` ],
  //       [ ( str ) => /nada/.test( str ), str=> `la cadena tiene nada, ${str}` ],
  //       [ True, str=> `solo es, ${str}` ],
  //     ]);
  //     x( 'algo' ).fork(( str ) => assert.equal( 'la cadena tiene algo, algo', str ));//?
  //     x( 'nada' ).fork(( str ) => assert.equal( 'la cadena tiene nada, nada', str ));//?
  //     x( 'a' ).fold(( str ) => assert.equal( 'solo es, a', str ));//?
  //   });
  // });
});