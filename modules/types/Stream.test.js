const { curry, compose } = require( '../functions.js' );
const { assert } = require( 'chai' );
const t = require( '../transducers.js' );
const sinon = require( 'sinon' );
const {
  stream,
  map,
  filter,
  reduce,
  on,
  once,
  transduce,
  combine,
  immediate,
  chain,
  ap,
  fromPromise,
  flattenPromise,
  bufferCount,
  skip,
  getReadOnly
} = require( './Stream.js' );

describe( 'Streams', function() {
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
    const s2 = map(( value ) => value * 2, s );
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
    const filtered = filter( isEven, s );
    s( 1 )( 2 )( 4 )( 3 );
    assert.equal( filtered(), 4 );
    s( 1 )( 6 )( 1 );
    assert.equal( filtered(), 6 );
    s( 10 );
    assert.equal( filtered(), 10 );
  });
  it( 'reduce over a streamed values', () => {
    const s = stream();
    const reduced = reduce(( acc, curr ) => acc + curr, 0, s );
    s( 1 )( 2 )( 4 )( 3 );
    assert.equal( reduced(), 10 );
  });
  it( 'fires on like an event emmiter', () => {
    const s = stream();
    const onSpy = sinon.spy();
    on( onSpy, s );
    s( 1 )( 2 )( 4 )( 3 );
    assert.equal( onSpy.args[0][0], 1 );
    assert.equal( onSpy.args[1][0], 2 );
    assert.equal( onSpy.args[2][0], 4 );
    assert.equal( onSpy.args[3][0], 3 );
  });
  it( 'fires once like an event emmiter', () => {
    const s = stream();
    const onSpy = sinon.spy();
    const onceStream = once( s );
    on( onSpy, onceStream );
    s( 1 )( 2 )( 4 )( 3 );
    onSpy.calledOnce;//?
    onSpy.callCount;//?
    assert.isTrue( onSpy.calledOnce );//?
    assert.equal( onSpy.args[0][0], 1 );
  });
  it( 'Can transduce the values of a stream', () => {
    const results = [];
    const s1 = stream();
    const transducer = compose(
      t.map( function( x ) { return x * 2; }),
      t.dedupe(),
    );
    const s2 = transduce( transducer, s1 );
    // sCombine( function( s2 ) { results.push( s2()); }, [s2]);
    on( data => results.push( data ), s2 );
    s1( 1 )( 1 )( 2 )( 3 )( 3 )( 3 )( 4 )( 2 );
    assert.deepEqual( results, [ 2,4,6,8,4 ]);
  });
  it( 'combines two streams', () => {
    const x = stream( 4 );
    const y = stream( 6 );
    const changeStream = stream();
    const sum = combine( function( x, y, self, changed ) {
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
    const sum = combine( function( x, y ) {
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
    const hasItems = combine( function( s ) {
      return s() !== undefined && s().length > 0;
    }, [s]);
    const immediateHasItems = immediate( combine( function( s ) {
      return s() !== undefined && s().length > 0;
    }, [s]));
    assert.isUndefined( hasItems());
    assert.isFalse( immediateHasItems());
    s([1]);
    assert.isTrue( hasItems());
    assert.isTrue( immediateHasItems());
  });
  it( 'Extract a value from promises 1', ( done ) => {
    const promise = fromPromise( Promise.resolve( 'someValue' ));
    combine( s => {
      assert.equal( s(), 'someValue' );
      done();
    }, [promise]);
  });
  it( 'Extract a value from promises 2', ( done ) => {
    const filter = stream( 'asdf' );
    const results = filter .pipe( chain( filter => fromPromise( Promise.resolve( filter ))));
    combine( s => {
      assert.equal( s(), 'asdf' );
      done();
    }, [results]);
  });
  it( 'Extract a value from promises 2', ( done ) => {
    const filter = stream( 'asdf' );
    const results = filter .pipe( chain( filter => fromPromise( Promise.resolve( filter ))));
    combine( s => {
      assert.equal( s(), 'asdf' );
      done();
    }, [results]);
  });
  it( 'flattens a promise comming in a stream', ( done ) => {
    const s = stream();
    const result = s.map( num => Promise.resolve( num ))
      .pipe( flattenPromise );
    on(( data ) => {
      assert.equal( data, 20 );
      done();
    }, result );
    s( 20 );
  });
  it( 'Chains the streams', ( done ) => {
    const filter = stream( 'filter' );
    const search_results = chain( function( filter ){
      return stream( filter );
    }, filter );
    on( value => {
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
      .pipe( ap( filter ))
      .pipe( ap( sortProperty ))
      .pipe( ap( sortDirection ))
      .pipe( map( function( d ){ return d; }));
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
  
  describe( 'bufferCount', function() {
    it( 'streams an array with the buffer size specified', ( done ) => {
      const s = stream();
      bufferCount( 3, s )
        .map( data => {
          assert.deepEqual( data, [ 1,2,3 ]);
          done();
        });
      s( 1 );
      s( 2 );
      s( 3 );
    });
    it( 'buffers 4 items every 2 items', ( done ) => {
      const s = stream();
      let count = 0;
      bufferCount( 4, 2, s )
        .map( data => {
          count++;
          if ( count === 1 ){
            assert.deepEqual( data, [ 1,2,3,4 ]);
          } else if ( count === 2 ) {
            assert.deepEqual( data, [ 3,4,5,6 ]);
          } else {
            assert.deepEqual( data, [ 5,6,7,8 ]);
            done();
          }
        });
      s( 1 );
      s( 2 );
      s( 3 );
      s( 4 );
      s( 5 );
      s( 6 );
      s( 7 );
      s( 8 );
    });
  });

  describe( 'skip', function() {
    it( 'skip the first 3 items in a stream', ( done ) => {
      const s = stream();
      let count = 0;
      skip( 3, s )
        .map( num => {
          count++;
          if ( count === 1 ){
            assert.equal( num, 4 );
          } else {
            assert.equal( num, 5 );
            done();
          }
        });
      s( 1 );
      s( 2 );
      s( 3 );
      s( 4 );
      s( 5 );
    });
  });

  describe( 'getReadOnly', function() {
    it( 'Does not modify the original stream when set', () => {
      const a = stream();
      const aRO = getReadOnly( a );
      a( 10 );
      assert.equal( aRO(), 10 );
      aRO( 20 );
      assert.equal( a(), 10 );
    });
    it( 'Does not modify the original stream when set', () => {
      const a = stream();
      const aRO = combine( x=>x(), [a]);
      a( 10 );
      assert.equal( aRO(), 10 );
      aRO( 20 );
      assert.equal( a(), 10 );
    });
    it( 'Does not modify the original stream when set', ( done ) => {
      const a = stream();
      const aRO = getReadOnly( a );
      const b = stream();
      const bRO = getReadOnly( b );
      const combineStub = sinon.stub();
      combineStub.callsFake(() => {
        return 50;
      });
      combine( combineStub, [ aRO, bRO ]);
      b( 3 );
      a( 4 );
      assert.equal( combineStub.args[0][3][0], bRO );
      assert.equal( combineStub.args[0][3][1], aRO );
      done();
    });
  });
});
