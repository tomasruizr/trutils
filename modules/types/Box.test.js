const { True, I, False } = require( '../functions.js' );
const Box = require( './Box.js' );
const Task = require( './Task.js' );
const { fromCondition, fromOptions } = Box;
const Either = require( './Either.js' );
const { assert } = require( 'chai' );

describe( 'fromCondition', function() {
  it.only( 'returns a left in case condition is not true', () => {
    const gt2 = fromCondition( num => num > 2, num => `${num} is gt 2`, num => `${num} is lte 2` );
    assert.deepEqual( gt2( 1 ).fold( I ), '1 is lte 2' );
    assert.deepEqual( gt2( 2 ).fold( I ), '2 is lte 2' );
    assert.deepEqual( gt2( 3 ).fold( I ), '3 is gt 2' );
  });
});

describe( 'fromOptions', function() {
  it.only( 'returns a left in case condition is not true', () => {
    const x = fromOptions([
      [ ( str ) => /algo/.test( str ), str=> `la cadena tiene algo, ${str}` ],
      [ ( str ) => /nada/.test( str ), str=> `la cadena tiene nada, ${str}` ],
      [ True, str=> `solo es, ${str}` ],
    ]);
    x( 'algo' ).fold(( str ) => assert.equal( 'la cadena tiene algo, algo', str ));//?
    x( 'nada' ).fold(( str ) => assert.equal( 'la cadena tiene nada, nada', str ));//?
    x( 'a' ).fold(( str ) => assert.equal( 'solo es, a', str ));//?
  });
});