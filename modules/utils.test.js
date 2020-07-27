const { I, noop, isError } = require( './functions.js' );
const Task = require( './types/Task.js' );
const Either = require( './types/Either.js' );
const { assert } = require( 'chai' );
const { 
  jsonParse,
  runMiddleWares,
  cor,
  eitherToTask,
  fromNullableToTask,
  fromFalseableToTask,
  ensureTask } = require( './utils.js' );

describe( 'utils', function() {
  describe( 'jsonParse', function() {
    it( 'returns an Either.Right with the parsed json', () => {
      const json = JSON.stringify({ name:'tomas' });
      assert.isTrue( jsonParse( json ).isRight );
      assert.deepEqual( jsonParse( json ).fold( noop, I ), { name:'tomas' });
    });
    it( 'returns an Either.Left if malcformed json', () => {
      const json = '';
      assert.isTrue( jsonParse( json ).isLeft );
      assert.isTrue( isError( jsonParse( json ).fold( I, noop )));
    });
  });

  describe( 'run middlewares', function() {
    it( 'executes a list of middlewares succesfully for one param', () => {
      const mdw = [
        ( data, next ) => {
          data.name = `${data.name}1`;
          next();
        }, 
        ( data, next ) => {
          data.name = `${data.name}2`;
          next();
        }, 
        ( data, next ) => {
          data.name = `${data.name}3`;
          next();
        }, 
      ];
      let data = { name: 'string' };
      runMiddleWares( mdw, data )
        .fork( noop, ( result ) => {
          assert.deepEqual( result[0], { name: 'string123' });
          assert.deepEqual( data, { name: 'string123' });
        });
    });
    it( 'executes a list of middlewares succesfully for more than one param', () => {
      const mdw = [
        ( data1, data2, next ) => {
          data1.name = `${data1.name}1`;
          data2.name = `${data2.name}11`;
          next();
        }, 
        ( data1, data2, next ) => {
          data1.name = `${data1.name}2`;
          data2.name = `${data2.name}22`;
          next();
        }, 
        ( data1, data2, next ) => {
          data1.name = `${data1.name}3`;
          data2.name = `${data2.name}33`;
          next();
        }, 
      
      ];
      let data1 = { name: 'string' };
      let data2 = { name: 'string' };
      runMiddleWares( mdw, data1, data2 )
        .fork( noop, ( result ) => {
          assert.deepEqual( result[0], { name: 'string123' });
          assert.deepEqual( data1, { name: 'string123' });
          assert.deepEqual( result[1], { name: 'string112233' });
          assert.deepEqual( data2, { name: 'string112233' });
        });
    });
    it( 'executes a list of middlewares and then yields an error', () => {
      const mdw = [
        ( data1, data2, next ) => {
          data1.name = `${data1.name}1`;
          data2.name = `${data2.name}11`;
          next();
        }, 
        ( data1, data2, next ) => {
          data1.name = `${data1.name}2`;
          data2.name = `${data2.name}22`;
          next( 'some error' );
        }, 
        ( data1, data2, next ) => {
          assert( false ); // we should not get here
          data1.name = `${data1.name}3`;
          data2.name = `${data2.name}33`;
          next();
        }, 
      
      ];
      let data1 = { name: 'string' };
      let data2 = { name: 'string' };
      runMiddleWares( mdw, data1, data2 )
        .fork( err => assert.equal( err, 'some error' ), () => assert( false , 'I should be in the left side' ));
    });
  });

  describe( 'cor', function() {
    it( 'Runs a chain of responsability over pure functions when no functions', () => {
      cor([], 'some' )
        .fork(() => assert( false ), str => {
          assert.equal( str, 'some' );
        });
    });
    it( 'Runs a chain of responsability over pure functions', () => {
      cor([
        str => `${str}!`,
        str => `${str}@`,
      ], 'some' )
        .fork(() => assert( false ), str => {
          assert.equal( str, 'some!@' );
        });
    });
    it( 'Runs a chain of responsability over functions returning tasks', () => {
      cor([
        str => Task.of( `${str}!` ),
        str => new Task(( rej, res ) => res( `${str}@` )),
      ], 'some' )
        .fork(() => assert( false ), str => {
          assert.equal( str, 'some!@' );
        });
    });
    it( 'Runs a chain of responsability over functions returning promises', () => {
      cor([
        str => Promise.resolve( `${str}!` ),
        str => new Promise(( res ) => res( `${str}@` )),
      ], 'some' )
        .fork(() => assert( false ), str => {
          assert.equal( str, 'some!@' );
        });
    });
    it( 'Runs a chain of responsability over functions returning pure,  promises or tasks', ( done ) => {
      cor([
        str => Task.of( `${str}!` ),
        str => new Promise(( res ) => setTimeout( res( `${str}@` ), 10 )),
        str => `${str}#`,
      ], 'some' )
        .fork(() => assert( false ), str => {
          assert.equal( str, 'some!@#' );
          done();
        });
    });
    it( 'Runs a chain of responsability and return early for Task.Rejected', ( done ) => {
      cor([
        str => Task.of( `${str}!` ),
        str => new Task(( rej ) => setTimeout( rej( `${str}@` ), 10 )),
        str => `${str} this one won't show`,
      ], Task.of( 'some' ))
        .fork(() => assert( false ), str => {
          assert.equal( str, 'some!@' );
          done();
        });
    });
    it( 'Runs a chain of responsability and return early for Promise.Rejected', ( done ) => {
      cor([
        str => Task.of( `${str}!` ),
        str => new Promise(( res, rej ) => setTimeout( rej( `${str}@` ), 10 )),
        str => `${str} this one won't show`,
      ], 'some' )
        .fork(() => assert( false ), str => {
          assert.equal( str, 'some!@' );
          done();
        });
    });
    it( 'Runs a chain of responsability and rejects if chain link promise.rejects an instance of Error', ( done ) => {
      cor([
        str => Task.of( `${str}!` ),
        () => Promise.reject( new Error( 'Some Error' )),
        str => `${str} this one won't show`,
      ], 'some' )
        .fork( err => {
          assert.isTrue( isError( err ));
          assert.equal( err.message, 'Some Error' );
          done();
        }, () => assert( false ));
    });
    it( 'Runs a chain of responsability and rejects if chain link task.rejects an instance of Error', ( done ) => {
      cor([
        str => Task.of( `${str}!` ),
        () => Task.rejected( new Error( 'Some Error' )),
        str => `${str} this one won't show`,
      ], 'some' )
        .fork( err => {
          assert.isTrue( isError( err ));
          assert.equal( err.message, 'Some Error' );
          done();
        }, () => assert( false ));
    });
    it( 'Runs a chain of responsability and rejects if chain link throws an Error', ( done ) => {
      cor([
        str => Task.of( `${str}!` ),
        () => { throw new Error( 'Some Error' ) ; },
        str => `${str} this one won't show`,
      ], 'some' )
        .fork( err => {
          assert.isTrue( isError( err ));
          assert.equal( err.message, 'Some Error' );
          done();
        }, () => assert( false ));
    });
  });

  describe( 'eitherToTask', function() {
    it( 'parses an Right to a task', () => {
      const task = eitherToTask( Either.Right( 'hola' ));
      assert.isTrue( Task.isTask( task ));
      task.fork(()=> assert( false ), ( str ) => assert( str, 'hola' ));
    });
    it( 'parses an Left to a task', () => {
      const task = eitherToTask( Either.Left( 'hola' ));
      assert.isTrue( Task.isTask( task ));
      task.fork(( str ) => assert( str, 'hola' ), ()=> assert( false ));
    });
  });

  describe( 'fromNullableToTask', function() {
    it( 'returns rejected task of null', () => {
      assert.isTrue( Task.isTask( fromNullableToTask( null )));
      fromNullableToTask( null ).fork(() => assert( true ), () => assert( false ));
    });
    it( 'returns rejected task of empty', () => {
      assert.isTrue( Task.isTask( fromNullableToTask()));
      fromNullableToTask().fork(() => assert( true ), () => assert( false ));
    });
    it( 'returns rejected task of undefined', () => {
      assert.isTrue( Task.isTask( fromNullableToTask( undefined )));
      fromNullableToTask( undefined ).fork(() => assert( true ), () => assert( false ));
    });
    it( 'returns task of anything', () => {
      assert.isTrue( Task.isTask( fromNullableToTask( 0 )));
      fromNullableToTask( 0 ).fork(() => assert( false ), () => assert( true ));
      assert.isTrue( Task.isTask( fromNullableToTask( 'u' )));
      fromNullableToTask( 'u' ).fork(() => assert( false ), () => assert( true ));
      assert.isTrue( Task.isTask( fromNullableToTask( false )));
      fromNullableToTask( false ).fork(() => assert( false ), () => assert( true ));
      assert.isTrue( Task.isTask( fromNullableToTask({})));
      fromNullableToTask({}).fork(() => assert( false ), () => assert( true ));
      assert.isTrue( Task.isTask( fromNullableToTask([])));
      fromNullableToTask([]).fork(() => assert( false ), () => assert( true ));
      assert.isTrue( Task.isTask( fromNullableToTask( function(){})));
      fromNullableToTask( function(){}).fork(() => assert( false ), () => assert( true ));
    });
  });

  describe( 'fromFalseableToTask', function() {
    it( 'returns rejected task of condition', () => {
      assert.isTrue( Task.isTask( fromFalseableToTask( array=>array.length )([])));
      fromFalseableToTask( array=>array.length )([]).fork(() => assert( true ), () => assert( false ));
    });
    it( 'returns task of anything', () => {
      assert.isTrue( Task.isTask( fromFalseableToTask( array=>array.length )(['hola'])));
      fromFalseableToTask( array=>array.length )(['hola']).fork(() => assert( false ), () => assert( true ));
    });
  });

  describe( 'ensureTask', function() {
    it( 'Ensures the value passed is a Task or casts one', () => {
      const t1 = ensureTask( 'hola' );
      t1.fork( noop, data => assert.equal( data, 'hola' ));
      const t2 = ensureTask( Task.of( 'hola' ));
      t2.fork( noop, data => assert.equal( data, 'hola' ));
      const t3 = ensureTask( new Task(( rej, res ) => res( 'hola' )));
      t3.fork( noop, data => assert.equal( data, 'hola' ));
    });
  });
});