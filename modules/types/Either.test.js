const { I, True } = require( '../functions.js' );
const { of, Left, Right, fromNullable, fromFalseable, fromValidation, fromValidations, fromOptions, isEither, all, any } = require( './Either.js' );
const Box = require( './Box.js' );
const { assert } = require( 'chai' );
const sinon = require( 'sinon' );
const identity = x => x;

describe( 'Either', function() {
  const assertError = () => assert( false );
  
  describe( 'map', function() {
    it( 'maps the data inside a Right', () => {
      Right( 'hola' )
        .map( str=> str.toUpperCase())
        .fold( assertError, str => assert.equal( str, 'HOLA' ));
    });
    it( 'skips the map of a Left', () => {
      Left( 'hola' )
        .map( str=> str.toUpperCase())
        .fold( str => assert.equal( str, 'hola' ), assertError );
    });
  });

  describe( 'leftMap', function() {
    it( 'maps the data inside a Left', () => {
      Left( 'hola' )
        .leftMap( str=> str.toUpperCase())
        .fold( str => assert.equal( str, 'HOLA' ), assertError );
    });
    it( 'maps the data inside a Left', () => {
      Right( 'hola' )
        .chain( str=> Left( str.toUpperCase()))
        .leftMap( str => str.toLowerCase())
        .map(() => 'NOTHING' )
        .fold( str => assert.equal( str, 'hola' ), assertError );
    });    
  });

  describe( 'bimap', function() {
    it( 'executes a map operation if is Right', done => {
      of( 'String' )
        .bimap( str => str.toUpperCase())
        .map( str => {
          assert.equal( str, 'STRING' );
        })
        .fold( done, () => done());
    });
    it( 'executes a map operation if is Left', done => {
      Left( 'String' )
        .bimap( str => str.toUpperCase())
        .leftMap( str => {
          assert.equal( str, 'STRING' );
        })
        .fold(() => done(), done );
    });
  });

  describe( 'chain', function() {
    it( 'chains the data inside a Right', () => {
      Right( 'hola' )
        .chain( str=> Right( str.toUpperCase()))
        .fold( assertError, str => assert.equal( str, 'HOLA' ));
    });
    it( 'chains the data inside a Left', () => {
      Left( 'hola' )
        .chain( str=> Right( str.toUpperCase()))
        .fold( str => assert.equal( str, 'hola' ), assertError );
    });
  });

  describe( 'effect', function() {
    it( 'makes a side effect operation if Right', done => {
      const spy = sinon.spy();
      Right( 'string' )
        .effect( spy )
        .map(( str ) => {
          assert.equal( str, 'string' );
          assert.isTrue( spy.calledOnce );
          assert.isTrue( spy.calledWith( 'string' ));
        })
        .fold( done, () => done());
    });
    it( 'makes a side effect operation if Left', done => {
      const spy = sinon.spy();
      Left( 'string' )
        .effect( spy )
        .leftMap(( str ) => {
          assert.equal( str, 'string' );
          assert.isTrue( spy.calledOnce );
          assert.isTrue( spy.calledWith( 'string' ));
        })
        .fold(() => done(), done );
    });
  });

  describe( 'ap', function() {
    it( 'Applies a Functor(value) to a Right(function)', () => {
      Right( str1 => str2 => `${str1} ${str2}`.toUpperCase())
        .ap( Right( 'hola' ))
        .ap( Right( 'pana' ))
        .fold(() => assert( false ), str => assert.equal( str, 'HOLA PANA' ));
    });
    it( 'Left wont apply the functions and fold to left', () => {
      const result = Left( str1 => str2 => `${str1} ${str2}`.toUpperCase())
        .ap( Right( 'hola' ))
        .ap( Right( 'pana' ))
        .fold(() => false, () => true );
      assert.isFalse( result );
    });
  });

  describe( 'concat', function() {
    it( 'Concats a Right to a Right', () => {
      Right( 'hola ' )
        .concat( Right( 'pana' ))
        .fold( assertError, str => assert.equal( str, 'hola pana' ));
    });
    it( 'concats a Right to a Left', () => {
      Right( 'hola ' )
        .concat( Left( 'pana' ))
        .fold( assertError, str => assert.equal( str, 'hola ' ));
    });
    it( 'concats a Left to a Right', () => {
      Left( 'hola ' )
        .concat( Right( 'pana' ))
        .fold( assertError, str => assert.equal( str, 'pana' ));
    });
    it( 'concats a Left to a Left', () => {
      Left( 'hola ' )
        .concat( Left( 'pana' ))
        .fold( str => assert.equal( str, 'hola ' ), assertError );
    });
  });

  describe( 'traverse', function() {
    it( 'traverses a Right value into Box', () => {
      const traversed = Right( 'hola' )
        .traverse( null , Box );
      assert.isTrue( /^Box/.test( traversed.inspect()));
      traversed.fold(( r ) => assert.isTrue( r.isRight ));
    });
    it( 'traverses a Left value into Box', () => {
      const traversed = Left( 'hola' )
        .traverse( Box , Box );
      assert.isTrue( /^Box/.test( traversed.inspect()));
      traversed.fold(( r ) => assert.isTrue( r.isLeft ));
    });
  });

  describe( 'inspect', function() {
    it( 'inspects a value (show)', () => {
      assert.equal( Right( 'hola' ).inspect(), 'Right(hola)' );
      assert.equal( Left( 'hola' ).inspect(), 'Left(hola)' );
    });
  });

  describe( 'fromNullable', function() {
    it( 'returns a right if data is not nullable', () => {
      fromNullable( 'hola' ).fold( assertError, data => assert.equal( data, 'hola' ));
      fromNullable( 0 ).fold( assertError, data => assert.equal( data, 0 ));
      fromNullable( false ).fold( assertError, data => assert.equal( data, false ));
      fromNullable( '' ).fold( assertError, data => assert.equal( data, '' ));
      fromNullable({}).fold( assertError, data => assert.deepEqual( data, {}));
      fromNullable([]).fold( assertError, data => assert.deepEqual( data, []));
    });
    it( 'returns a left if data is nullable', () => {
      fromNullable().fold( assert.isNull, assertError );
      fromNullable( undefined ).fold( assert.isNull, assertError );
      fromNullable( null ).fold( assert.isNull, assertError );
    });
  });

  describe( 'isEither', function() {
    it( 'returns true if the data passed is a Right or a Left', () => {
      assert.isTrue( isEither( Right()));
      assert.isTrue( isEither( Right( 'hola' )));
      assert.isTrue( isEither( Left()));
      assert.isTrue( isEither( Left( 'hola' )));
    });
    it( 'returns false if the data passed is not a Right or a Left', () => {
      assert.isFalse( isEither());
      assert.isFalse( isEither( 'hola' ));
      assert.isFalse( isEither());
      assert.isFalse( isEither( 'hola' ));
    });
  });
  
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
    it( 'returns a right in case validation is true', ()=>{
      assert.deepEqual( fromValidation( 1 < 2 )( null ).fold( null, I ), Right( null ).fold( null, I ));
      assert.deepEqual( fromValidation(() => 1 < 2 )( null ).fold( null, I ), Right( null ).fold( null, I ));
      assert.deepEqual( fromValidation( 0 + 12 )( null ).fold( null, I ), Right( null ).fold( null, I ));
      assert.deepEqual( fromValidation(() => 'asdf' )( null ).fold( null, I ), Right( null ).fold( null, I ));
    });
    it( 'returns a Left in case validation is false', ()=>{
      assert.deepEqual( fromValidation( 1 > 2 )( null ).fold( I ), Left( null ).fold( I ));
      assert.deepEqual( fromValidation(() => 1 > 2 )( null ).fold( I ), Left( null ).fold( I ));
      assert.deepEqual( fromValidation( 0 )( null ).fold( I ), Left( null ).fold( I ));
      assert.deepEqual( fromValidation(() => '' )( null ).fold( I ), Left( null ).fold( I ));
    });
  });
  
  describe( 'fromValidations', function() {
    it( 'returns a right in case all validations are true', ()=>{
      const e = fromValidations([
        [n => n > 1],
        [n => n < 3],
        [n => n === 2]
      ])( 2 );
      assert.deepEqual( e.fold( null, I ), Right( 2 ).fold( null, I ));
    });
    it( 'returns a Left in case validation is false', ()=>{
      const e = fromValidations([
        [ n => n > 1, '' ],
        [ n => n < 3, '' ],
        [ n => n === 2, '' ],
        [ n => n === 3, 'El numero es invalido' ],
      ])( 2 ).fold( I,I );
      assert.deepEqual( e, ['El numero es invalido']);
    });
  });
  
  describe( 'fromOptions', function() {
    it( 'returns a Right with the value in case condition is true', () => {
      const x = fromOptions([
        [ ( str ) => /algo/.test( str ), str=> `la cadena tiene algo, ${str}` ],
        [ ( str ) => /nada/.test( str ), str=> `la cadena tiene nada, ${str}` ],
        [ True, str=> `solo es, ${str}` ],
      ]);
      x( 'algo' ).fold( assertError, ( str ) => assert.equal( 'la cadena tiene algo, algo', str ));
      x( 'nada' ).fold( assertError, ( str ) => assert.equal( 'la cadena tiene nada, nada', str ));
      x( 'a' ).fold( assertError, ( str ) => assert.equal( 'solo es, a', str ));
    });
    it( 'returns a left in case condition is not true', () => {
      const x = fromOptions([
        [ ( str ) => /algo/.test( str ), str=> `la cadena tiene algo, ${str}` ],
        [ ( str ) => /nada/.test( str ), str=> `la cadena tiene nada, ${str}` ],
      ]);
      x( 'bla' ).fold( assert.isNull );
    });
  });

  describe( 'All', function() {
    it( 'returns true if all are true', () => {
      assert.isTrue( all([true], 1 ));
      assert.isTrue( all([ true, true ], 1 ));
      assert.isTrue( all([ true, true, true ], 1 ));
      assert.isTrue( all([ true, ( data )=> data, true ], 1 ));
    });
    it( 'returns false if any is false', () => {
      assert.isFalse( all([ true, true, false ], 1 ));
      assert.isFalse( all([ true, false, true ], 1 ));
      assert.isFalse( all([ false, true, true ], 1 ));
      assert.isFalse( all([ true, data => data === 0, true ], 1 ));
    });
  });
  
  describe( 'Any', function() {
    it( 'returns true if any is true', () => {
      assert.isTrue( any([ true, true, false ], 1 ));
      assert.isTrue( any([ false, false, true ], 1 ));
      assert.isTrue( any([ false, true, true ], 1 ));
      assert.isTrue( any([ false, data => data === 0, true ], 1 ));
    });
    it( 'returns false if any is false', () => {
      assert.isFalse( any([false], 1 ));
      assert.isFalse( any([ false, false ], 1 ));
      assert.isFalse( any([ false, false, false ], 1 ));
      assert.isFalse( any([ false, ( data )=> !data, false ], 1 ));
    });
  });
});