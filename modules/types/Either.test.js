const { I } = require( '../functions.js' );
const { Left, Right, fromFalseable, fromValidation } = require( './Either.js' );
const { assert } = require( 'chai' );
const identity = x => x;

describe( 'fromFalseable', function() {
  it( 'returns a left in case of null', () => {
    assert.deepEqual( fromFalseable( null ).fold( identity ), Left( null ).fold( identity ));
  });
  it( 'returns a left in case of undefined', ()=>{
    assert.deepEqual( fromFalseable( undefined ).fold( identity ), Left( undefined ).fold( identity ));
  });
  it( 'returns a left in case of 0', ()=>{
    assert.deepEqual( fromFalseable( 0 ).fold( identity ), Left( 0 ).fold( identity ));
  });
  it( 'returns a left in case of ""', ()=>{
    assert.deepEqual( fromFalseable( '' ).fold( identity ), Left( '' ).fold( identity ));
  });
  it( 'returns a left in case of false', ()=>{
    assert.deepEqual( fromFalseable( false ).fold( identity ), Left( false ).fold( identity ));
  });
  it( 'returns a right in any other case', ()=>{
    assert.deepEqual( fromFalseable( 3 ).fold( null, identity ), Right( 3 ).fold( null, identity ));
    assert.deepEqual( fromFalseable( '3' ).fold( null, identity ), Right( '3' ).fold( null, identity ));
    assert.deepEqual( fromFalseable([]).fold( null, identity ), Right([]).fold( null, identity ));
    assert.deepEqual( fromFalseable({}).fold( null, identity ), Right({}).fold( null, identity ));
  });
});

describe( 'fromValidation', function() {
  it( 'returns a right in case condition is true', ()=>{
    assert.deepEqual( fromValidation( 1 < 2 )( null ).fold( null, I ), Right( null ).fold( null, I ));
    assert.deepEqual( fromValidation(() => 1 < 2 )( null ).fold( null, I ), Right( null ).fold( null, I ));
    assert.deepEqual( fromValidation( 0 + 12 )( null ).fold( null, I ), Right( null ).fold( null, I ));
    assert.deepEqual( fromValidation(() => 'asdf' )( null ).fold( null, I ), Right( null ).fold( null, I ));
  });
});