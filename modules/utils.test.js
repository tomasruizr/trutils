const { I, noop, isError } = require( './functions.js' );
const { jsonParse, runMiddleWares, cor } = require( './utils.js' );
const Task = require( './types/Task.js' );
const { assert } = require( 'chai' );

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
});

describe( 'cor', function() {
  it( 'Runs a chain of responsability for one function succesfuly', () => {
    cor([
      str => Task.of( `${str}$` ),
      str => Task.of( `${str}@` ),
      str => Task.of( `${str}#` ),
      str => Task.fromPromise( new Promise( res => res( `${str}Promise` ))),
      str => /algo/.test( str ) ? Task.rejected( str ) : Task.of( str ),
      str => /nada/.test( str ) ? Task.rejected( new Error( 'nada es permitido' )) : Task.of( str ),
      // () => { throw new Error( 'Algun error' ); },
      str => Task.of( `${str}$` ),
      str => Task.of( `${str}%` ),
      str => new Task(( rej, res ) => res( `${str}^` )),
    ], 'nad' )
      .fork( console.error, str => console.log( `El resultado es ${str}` ));
  });
  // it( 'Runs a chain of responsability for one function that throws an error', ( done ) => {
  //   const neverCalled = sinon.spy();
  //   sComposeChain([
  //     ()=>{ throw new Error( 'some error' ); },
  //   ]).map( data => {
  //     assert.isTrue( neverCalled.notCalled );
  //     assert.instanceOf( data, Error );
  //     assert.equal( data.message, 'some error' );
  //     done();
  //   });
  // });
  // it( 'Runs a chain of responsability for 5 mixed functions returning promises and native values and returns the accumulated', ( done ) => {
  //   sComposeChain([
  //     ( current )=>Promise.resolve( `${current},2` ),
  //     ( current )=>`${current},3`,
  //     ( current )=>Promise.resolve( `${current},4` ),
  //     ( current )=>`${current},5`,
  //     ( current )=>Promise.resolve( current.split( ',' ))
  //   ], '1' ).map( response => {
  //     assert.isArray( response );
  //     assert.lengthOf( response, 5 );
  //     assert.equal( response[0], 1 );
  //     assert.equal( response[1], 2 );
  //     assert.equal( response[2], 3 );
  //     assert.equal( response[3], 4 );
  //     assert.equal( response[4], 5 );
  //     done();
  //   });
  // });
  // it( 'Runs a chain of responsability for 5 mixed functions returning promises and native values, interrupts the execution and returns the accumulated for promise reject', ( done ) => {
  //   const neverCalled = sinon.spy();
  //   sComposeChain([
  //     ( current )=>`${current},2`,
  //     ( current )=>Promise.resolve( `${current},3` ),
  //     ( current )=>Promise.reject( current ),
  //     neverCalled,
  //   ], '1' ).map( response => {
  //     assert.equal( response, '1,2,3' );
  //     assert.isTrue( neverCalled.notCalled );
  //     done();
  //   });
  // });
  // it( 'Runs a chain of responsability for 5 mixed functions returning promises and native values, interrupts the execution and returns the accumulated for throw', ( done ) => {
  //   const neverCalled = sinon.spy();
  //   sComposeChain([
  //     ( current )=>`${current},2`,
  //     ( current )=>Promise.resolve( `${current},3` ),
  //     ( current )=>{ throw current; },
  //     neverCalled
  //   ], '1' ).map( response => {
  //     assert.isTrue( neverCalled.notCalled );
  //     assert.equal( response, '1,2,3' );
  //     done();
  //   });
  // });
  // it( 'Runs a chain of responsability for 5 mixed functions returning promises and native values, interrupts the execution and returns the accumulated with throw error', ( done ) => {
  //   const neverCalled = sinon.spy();
  //   sComposeChain([
  //     ( current )=>Promise.resolve( `${current},2` ),
  //     ()=>{ throw new Error( 'algun error' ) ; },
  //     neverCalled,
  //   ], '1' ).map( response => {
  //     assert.isTrue( neverCalled.notCalled );
  //     assert.instanceOf( response, Error );
  //     assert.equal( response.message, 'algun error' );
  //     done();
  //   });
  // });
  // it( 'Runs a chain of responsability for 5 mixed functions returning promises and native values, interrupts the execution and returns the accumulated with throw error, inside a promise', ( done ) => {
  //   const neverCalled = sinon.spy();
  //   sComposeChain([
  //     ( current )=>Promise.resolve( `${current},2` ),
  //     ( current )=>`${current},3`,
  //     ()=>Promise.reject( new Error( 'algun error' )),
  //     neverCalled
  //   ], '1' ).map( response=>{
  //     assert.isTrue( neverCalled.notCalled );
  //     assert.equal( response.message, 'algun error' );
  //     done();
  //   });
  // });
});