const { I } = require( '../functions.js' );
const Box = require( './Box.js' );
const { fromCondition } = Box;
const { assert } = require( 'chai' );


describe( 'Box', function() {
  describe( 'fold', function() {
    it( 'folds the value inside the box', () => {
      assert.equal( Box( 'hola' ).fold( I ), 'hola' );
      assert.equal( Box( 'hola' ).fold( str => str.toUpperCase()), 'HOLA' );
    });
  });
  
  describe( 'chain', function() {
    it( 'chains the value inside the box, in this case similar to fold', () => {
      assert.equal( Box( 'hola' ).chain( I ), 'hola' );
      assert.equal( Box( 'hola' ).chain( str => str.toUpperCase()), 'HOLA' );
    });
  });
  
  describe( 'ap', function() {
    it( 'Applies a Box(value) to a Box(function)', () => {
      Box( str1 => str2 => `${str1} ${str2}`.toUpperCase())
        .ap( Box( 'hola' ))
        .ap( Box( 'pana' ))
        .fold( str => assert.equal( str, 'HOLA PANA' ));
    });
  });
  
  describe( 'inspect', function() {
    it( 'inspects a value (show)', () => {
      assert.equal( Box( 'hola' ).inspect(), 'Box(hola)' );
    });
  });

  describe( 'fromCondition', function() {
    it( 'returns the execution result of onFalse when condition function is false', () => {
      const gt2 = fromCondition( num => num > 2, num => `${num} is gt 2`, num => `${num} is lte 2` );
      assert.deepEqual( gt2( 1 ).fold( I ), '1 is lte 2' );
      assert.deepEqual( gt2( 2 ).fold( I ), '2 is lte 2' );
    });
    it( 'returns the execution result of onTrue when condition function is true', () => {
      const gt2 = fromCondition( num => num > 2, num => `${num} is gt 2`, num => `${num} is lte 2` );
      assert.deepEqual( gt2( 3 ).fold( I ), '3 is gt 2' );
    });
    it( 'returns the execution result of onFalse when condition value is false', () => {
      const gt2 = fromCondition( false, num => `${num} is gt 2`, num => `${num} is lte 2` );
      assert.deepEqual( gt2( 1 ).fold( I ), '1 is lte 2' );
      assert.deepEqual( gt2( 2 ).fold( I ), '2 is lte 2' );
    });
    it( 'returns the execution result of onTrue when condition value is true', () => {
      const gt2 = fromCondition( true, num => `${num} is gt 2`, num => `${num} is lte 2` );
      assert.deepEqual( gt2( 3 ).fold( I ), '3 is gt 2' );
    });
  });
});