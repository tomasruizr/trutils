const { map, dedupe } = require( './transducers.js' );
const { curry, compose } = require( './fp.js' );
const { assert } = require( 'chai' );
const sinon = require( 'sinon' );
const {
  stream,
  sMap,
  sFilter,
  sReduce,
  sOn,
  sOnce,
  sTransduce,
  sCombine,
  sImmediate,
  sChain,
  sApply,
  sFromPromise,
  sFlattenPromise,
  sComposeChain
} = require( './stream.js' );

describe( 'stream.js', function() {
  it( 'streams a value getter and setter', () => {
    const s = stream( 1 );
    assert.equal( 1, s());
    assert.equal( 1, s());
    s( 10 );
    assert.equal( 10, s());
    assert.equal( 10, s());
  });
  it( 'maps over a streamed value', () => {
    const s = stream( 1 );
    const s2 = sMap(( value ) => value * 2, s );
    assert.equal( s2(), 2 );
    assert.equal( s2(), 2 );
    s( 4 );
    assert.equal( s(), 4 );
    assert.equal( s2(), 8 );
    assert.equal( s2(), 8 );
  });
  it( 'filters over a streamed value', () => {
    const isEven = num => num % 2 === 0;
    const s = stream();
    const filtered = sFilter( isEven, s );
    s( 1 )( 2 )( 4 )( 3 );
    assert.equal( filtered(), 4 );
    s( 1 )( 6 )( 1 );
    assert.equal( filtered(), 6 );
    s( 10 );
    assert.equal( filtered(), 10 );
  });
  it( 'reduce over a streamed values', () => {
    const s = stream();
    const reduced = sReduce(( acc, curr ) => acc + curr, 0, s );
    s( 1 )( 2 )( 4 )( 3 );
    assert.equal( reduced(), 10 );
  });
  it( 'fires on like an event emmiter', () => {
    const s = stream();
    const onSpy = sinon.spy();
    sOn( onSpy, s );
    s( 1 )( 2 )( 4 )( 3 );
    assert.equal( onSpy.args[0][0], 1 );
    assert.equal( onSpy.args[1][0], 2 );
    assert.equal( onSpy.args[2][0], 4 );
    assert.equal( onSpy.args[3][0], 3 );
  });
  it( 'fires once like an event emmiter', () => {
    const s = stream();
    const onSpy = sinon.spy();
    sOn( onSpy, sOnce( s ));
    s( 1 )( 2 )( 4 )( 3 );
    assert.isTrue( onSpy.calledOnce );
    assert.equal( onSpy.args[0][0], 1 );
  });
  it( 'Can transduce the values of a stream', () => {
    const results = [];
    const s1 = stream();
    const transducer = compose(
      map( function( x ) { return x * 2; }),
      dedupe(),
    );
    const s2 = sTransduce( transducer, s1 );
    // sCombine( function( s2 ) { results.push( s2()); }, [s2]);
    sOn( data => results.push( data ), s2 );
    s1( 1 )( 1 )( 2 )( 3 )( 3 )( 3 )( 4 )( 2 );
    assert.deepEqual( results, [ 2,4,6,8,4 ]);
  });
  it( 'combines two streams', () => {
    const x = stream( 4 );
    const y = stream( 6 );
    const changeStream = stream();
    const sum = sCombine( function( x, y, self, changed ) {
      changed.map( s => changeStream({ changed:s === x ? 'x' : 'y', newValue: s(), self: self() }));
      return x() + y();
    }, [ x, y ]);
    assert.equal( sum(), 10 );
    x( 12 );
    assert.deepEqual( changeStream(), { changed:'x', newValue: 12, self: 10 });
    assert.equal( sum(), 18 );
    y( 8 );
    assert.deepEqual( changeStream(), { changed:'y', newValue: 8, self: 18 });
    assert.equal( sum(), 20 );
  });
  it( 'combines two streams', () => {
    const x = stream( 4 );
    const y = stream( 6 );
    const sum = sCombine( function( x, y ) {
      return x() + y();
    }, [ x, y ]);
    assert.equal( sum(), 10 );
    x( 12 );
    assert.equal( sum(), 18 );
    y( 8 );
    assert.equal( sum(), 20 );
  });
  it( 'supports for immediate calls to dependant streams', () => {
    const s = stream();
    const hasItems = sCombine( function( s ) {
      return s() !== undefined && s().length > 0;
    }, [s]);
    const immediateHasItems = sImmediate( sCombine( function( s ) {
      return s() !== undefined && s().length > 0;
    }, [s]));
    assert.isUndefined( hasItems());
    assert.isFalse( immediateHasItems());
    s([1]);
    assert.isTrue( hasItems());
    assert.isTrue( immediateHasItems());
  });
  it( 'Extract a value from promises 1', ( done ) => {
    const promise = sFromPromise( Promise.resolve( 'someValue' ));
    sCombine( s => {
      assert.equal( s(), 'someValue' );
      done();
    }, [promise]);
  });
  it( 'Extract a value from promises 2', ( done ) => {
    const filter = stream( 'asdf' );
    const results = filter .pipe( sChain( filter => sFromPromise( Promise.resolve( filter ))));
    sCombine( s => {
      assert.equal( s(), 'asdf' );
      done();
    }, [results]);
  });
  it( 'Extract a value from promises 2', ( done ) => {
    const filter = stream( 'asdf' );
    const results = filter .pipe( sChain( filter => sFromPromise( Promise.resolve( filter ))));
    sCombine( s => {
      assert.equal( s(), 'asdf' );
      done();
    }, [results]);
  });
  it( 'flattens a promise comming in a stream', ( done ) => {
    const s = stream();
    const result = s.map( num => Promise.resolve( num ))
      .pipe( sFlattenPromise );
    sOn(( data ) => {
      assert.equal( data, 20 );
      done();
    }, result );
    s( 20 );
  });
  it( 'Chains the streams', ( done ) => {
    const filter = stream( 'filter' );
    const search_results = sChain( function( filter ){
      return stream( filter );
    }, filter );
    sOn( value => {
      assert.equal( value, 'filter' );
      done();
    }, search_results );
  });
  it( 'applies partials to functions', ( done ) => {
    const get_results = function ( filter, sortProperty, sortDirection ) {
      return stream({ filter,sortProperty,sortDirection });
    };
    const filter = stream( '' );
    const sortProperty = stream( 'name' );
    const sortDirection = stream( 'descending' );
    const results = stream( curry( get_results ))
      .pipe( sApply( filter ))
      .pipe( sApply( sortProperty ))
      .pipe( sApply( sortDirection ))
      .pipe( sMap( function( d ){ return d; }));
    const onChange = sinon.spy();
    results.map( onChange, results );
    filter( 'asdf' );
    sortProperty( 'prop1' );
    sortDirection( 'dir1' );
    assert.deepEqual( onChange.args[0][0](), { filter: '', sortProperty: 'name', sortDirection: 'descending' });
    assert.deepEqual( onChange.args[1][0](), { filter: 'asdf', sortProperty: 'name', sortDirection: 'descending' });
    assert.deepEqual( onChange.args[2][0](), { filter: 'asdf', sortProperty: 'prop1', sortDirection: 'descending' });
    assert.deepEqual( onChange.args[3][0](), { filter: 'asdf', sortProperty: 'prop1', sortDirection: 'dir1' });
    done();
  });
  it( 'ends a stream in the middle of a map', () => {
    const s = stream();
    const mapSpy = sinon.spy();
    s.map( mapSpy );
    s( 1 )( 2 )( 3 );
    s.end( true );
    s( 1 )( 2 )( 3 );
    assert.equal( mapSpy.callCount, 3 );
  });
  it( 'Runs a chain of responsability for one function succesfuly', () => {
    const response = sComposeChain([
      ()=>'some value',
    ]);
    assert.equal( response(), 'some value' );
  });
  it( 'Runs a chain of responsability for one function that throws an error', ( done ) => {
    const neverCalled = sinon.spy();
    sComposeChain([
      ()=>{ throw new Error( 'some error' ); },
    ]).map( data => {
      assert.isTrue( neverCalled.notCalled );
      assert.instanceOf( data, Error );
      assert.equal( data.message, 'some error' );
      done();
    });
  });
  it( 'Runs a chain of responsability for 5 mixed functions returning promises and native values and returns the accumulated', ( done ) => {
    sComposeChain([
      ( current )=>Promise.resolve( `${current},2` ),
      ( current )=>`${current},3`,
      ( current )=>Promise.resolve( `${current},4` ),
      ( current )=>`${current},5`,
      ( current )=>Promise.resolve( current.split( ',' ))
    ], '1' ).map( response => {
      assert.isArray( response );
      assert.lengthOf( response, 5 );
      assert.equal( response[0], 1 );
      assert.equal( response[1], 2 );
      assert.equal( response[2], 3 );
      assert.equal( response[3], 4 );
      assert.equal( response[4], 5 );
      done();
    });
  });
  it( 'Runs a chain of responsability for 5 mixed functions returning promises and native values, interrupts the execution and returns the accumulated for promise reject', ( done ) => {
    const neverCalled = sinon.spy();
    sComposeChain([
      ( current )=>`${current},2`,
      ( current )=>Promise.resolve( `${current},3` ),
      ( current )=>Promise.reject( current ),
      neverCalled,
    ], '1' ).map( response => {
      assert.equal( response, '1,2,3' );
      assert.isTrue( neverCalled.notCalled );
      done();
    });
  });
  it( 'Runs a chain of responsability for 5 mixed functions returning promises and native values, interrupts the execution and returns the accumulated for throw', ( done ) => {
    const neverCalled = sinon.spy();
    sComposeChain([
      ( current )=>`${current},2`,
      ( current )=>Promise.resolve( `${current},3` ),
      ( current )=>{ throw current; },
      neverCalled
    ], '1' ).map( response => {
      assert.isTrue( neverCalled.notCalled );
      assert.equal( response, '1,2,3' );
      done();
    });
  });
  it( 'Runs a chain of responsability for 5 mixed functions returning promises and native values, interrupts the execution and returns the accumulated with throw error', ( done ) => {
    const neverCalled = sinon.spy();
    sComposeChain([
      ( current )=>Promise.resolve( `${current},2` ),
      ()=>{ throw new Error( 'algun error' ) ; },
      neverCalled,
    ], '1' ).map( response => {
      assert.isTrue( neverCalled.notCalled );
      assert.instanceOf( response, Error );
      assert.equal( response.message, 'algun error' );
      done();
    });
  });
  it( 'Runs a chain of responsability for 5 mixed functions returning promises and native values, interrupts the execution and returns the accumulated with throw error, inside a promise', ( done ) => {
    const neverCalled = sinon.spy();
    sComposeChain([
      ( current )=>Promise.resolve( `${current},2` ),
      ( current )=>`${current},3`,
      ()=>Promise.reject( new Error( 'algun error' )),
      neverCalled
    ], '1' ).map( response=>{
      assert.isTrue( neverCalled.notCalled );
      assert.equal( response.message, 'algun error' );
      done();
    });
  });
});
