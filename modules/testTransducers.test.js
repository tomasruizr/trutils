const t = require( './testTransduce.js' );
const immutable = require( 'immutable' );
const { 
  seq,
  into,
  map,
  filter,
  reduce,
  Reduced,
  dedupe,
  take,
  skip,
  takeUntil,
  skipWhile 
} = t;
const { compose } = require( './functions.js' );
const { assert } = require( 'chai' );

describe( 'transducers', function() {
  describe( 'creation of on the spot transducer', function() {
    it( 'makes use of an on-the-spot creation', () => {
      const nth = ( iteration, init = 0 ) => reducer => ({
        result: reducer.result,
        step: ( acc, curr ) => init++ < iteration ? reducer.step( acc, curr ) : Reduced( acc )
      });
      const arr = [...Array( 10 ).keys()];
      const result = into([],
        compose(
          filter( num => num % 2 === 0 ),
          map( num => num * 10 ),
          map( num => num / 2 ),
          nth( 2 )
        ),
        arr
      );
      assert.deepEqual( result, [ 0, 10 ]);
    });
  });
  describe( 'Current and Accumulate for everyone', function() {
    it( 'Receives current and accumulate on filter', () => {
      const obj = { a:1, b:2, c:3, d:4, e:1, f:3 };
      const result = seq(
        filter(([ , value ], accumulate ) => {
          assert.isObject( accumulate );
          return !Object.values( accumulate ).includes( value );
        })
        , obj );
      assert.deepEqual( result, { a:1, b:2, c:3, d:4 });
    });
  });
  describe.skip( 'immutable transduce performance', function() {
    it( 'Compares performance filtering an immutable list', () => {
      const ImmutableListReducerMutate = ()=> t.StandardReducer({
        '@@transducer/init': ( l ) => immutable.isList( l ) ? l : immutable.List( l ) ,
        '@@transducer/result': x => x,
        '@@transducer/step': ( list ) => list,
      });
      const ImmutableListReducer = ()=> t.StandardReducer({
        '@@transducer/init': ( l ) => immutable.isList( l ) ? l : immutable.List( l ) ,
        '@@transducer/result': x => x,
        '@@transducer/step': ( list, value ) => list.push( value ),
      });
      
      const ImmutableFilterReducer = ( predicate, reducer ) => t.StandardReducer({
        ...t.defaultReducerProps( reducer ),
        '@@transducer/step': ( acc, curr ) => predicate( curr, acc ) ? reducer['@@transducer/step']( acc, curr ) : acc.delete( acc.indexOf( curr )),
      });
      const filter = predicate => reducer => ImmutableFilterReducer( predicate, reducer );
      const arr = [...Array( 10 ).keys()];
      const x = immutable.List( arr );
      // Mutating the list
      const result = t.transduce( filter( v => v % 2 === 0 ), ImmutableListReducerMutate(), x, x ); //?.
      // Creating a new list
      const result3 = t.transduce( t.filter( v => v % 2 === 0 ), ImmutableListReducer(), immutable.List(), x ); //?.
      // Copying into array
      const result4 = t.into([], t.filter( v => v % 2 === 0 ), x, x ); //?.
      // Comparison with array
      const result5 = t.seq( t.filter( v => v % 2 === 0 ), arr ); //?.
      result;
      result3;
      result4;
      result5;
    });
  });
  describe( 'Arrays', function() {
    describe( 'seq', function() {
      it( 'accepts curring', () => {
        const arr = [...Array( 10 ).keys()];
        const res = seq(
          compose(
            filter( num => num % 2 === 0 ),
            map( num => num * 10 ),
            map( num => num / 2 ),
          ));
        assert.isFunction( res );
        const result = res( arr );
        assert.deepEqual( result, [ 0, 10, 20, 30, 40 ]);
      });
      it( 'reduces the operations with functional params order', () => {
        const arr = [...Array( 10 ).keys()];
        const result = seq(
          compose(
            filter( num => num % 2 === 0 ),
            map( num => num * 10 ),
            map( num => num / 2 ),
          ),
          arr
        ); //?.$
        assert.deepEqual( result, [ 0, 10, 20, 30, 40 ]);
      });
    });
    describe( 'reduce', function() {
      it( 'works with a seq, compose', () => {
        const arr = [...Array( 10 ).keys()];
        const result = seq(
          compose(
            filter( num => num % 2 === 0 ),
            map( num => num * 10 ),
            map( num => num / 2 ),
            reduce(( accumulate, current ) => accumulate + current, 0 ),
          ),
          arr
        ); //?.$
        assert.equal( result, 100 );
      });
    });
    describe( 'into', function() {
      it( 'accepts curring', () => {
        const arr = [...Array( 10 ).keys()];
        const res = into([], compose(
          filter( num => num % 2 === 0 ),
          map( num => num * 10 ),
          map( num => num / 2 ),
        ));
        assert.isFunction( res );
        const result = res( arr );
        assert.deepEqual( result, [ 0, 10, 20, 30, 40 ]);
      });
      it( 'reduces the operations with functional params order', () => {
        const arr = [...Array( 10 ).keys()];
        const result = into([],
          compose(
            filter( num => num % 2 === 0 ),
            map( num => num * 10 ),
            map( num => num / 2 ),
          ),
          arr
        );
        assert.deepEqual( result, [ 0, 10, 20, 30, 40 ]);
      });
    });
    describe( 'dedupe', function() {
      it( 'Does nothing if values are not duped', () => {
        const arr = [...Array( 10 ).keys()];
        const result = seq(
          compose(
            dedupe()
          ), arr );
        assert.deepEqual( result, arr );
      });    
      it( 'dedupes consecutive values from a stream of data', () => {
        const arr = [ 0,0,1,2,2,3,4,2,3,1,2,2,0 ];
        const result = seq(
          compose(
            dedupe()
          ), arr );
        assert.deepEqual( result, [ 0, 1, 2, 3, 4, 2, 3, 1, 2, 0 ]);
      });    
      it( 'dedupes values from all data streamed so far', () => {
        const arr = [ 0,0,1,2,2,3,4,2,3,1,2,2,0 ];
        const result = seq(
          compose(
            dedupe( true )
          ), arr );
        assert.deepEqual( result, [ 0, 1, 2, 3, 4 ]);
      });    
    });
    describe( 'take', function() {
      it( 'takes from a stream of data starting on one element for a count of elements', () => {
        const arr = [...Array( 10 ).keys()];
        assert.deepEqual( seq( compose( take()), arr ), [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
        assert.deepEqual( seq( compose( take( 2 )), arr ), [ 0, 1 ]);
      });
    });
    describe( 'skip', function() {
      it( 'takes from a stream of data starting on one element for a count of elements', () => {
        const arr = [...Array( 10 ).keys()];
        assert.deepEqual( seq( compose( skip()), arr ), [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
        assert.deepEqual( seq( compose( skip( 2 )), arr ), [ 2, 3, 4, 5, 6, 7, 8, 9 ]);
      });
    });
    describe( 'takeWhile', function() {
      it( 'takes from a stream of data while condition is true', () => {
        const arr = [...Array( 10 ).keys()];
        assert.deepEqual( seq( compose( takeUntil( v => v !== 4 )), arr ), [ 0, 1, 2, 3 ]);
      });
    });
    describe( 'skipWhile', function() {
      it( 'takes from a stream of data starting on one element for a count of elements', () => {
        const arr = [...Array( 10 ).keys()];
        assert.deepEqual( seq( compose( skipWhile( v => v !== 4 )), arr ), [ 4, 5, 6, 7, 8, 9 ]);
      });
    });
  });
  describe( 'Objects', function() {
    describe( 'seq', function() {
      it( 'accepts curring', () => {
        const obj = [...Array( 10 ).keys()].reduce(( acc, curr ) => { acc[curr] = curr; return acc ; }, {});
        const res = seq(
          compose(
            filter(([ , value ]) => value % 2 === 0 ),
            map(([ key, value ]) => [ key, value * 10 ]),
            map(([ key, value ]) => [ key, value / 2 ]),
          ));
        assert.isFunction( res );
        const result = res( obj );
        assert.deepEqual( result, { 0: 0, 2: 10, 4: 20, 6: 30, 8: 40 });
      });
      it( 'reduces the operations with functional params order', () => {
        const obj = [...Array( 10 ).keys()].reduce(( acc, curr ) => { acc[curr] = curr; return acc ; }, {});
        const result = seq(
          compose(
            filter(([ , value ]) => value % 2 === 0 ),
            map(([ key, value ]) => [ key, value * 10 ]),
            map(([ key, value ]) => [ key, value / 2 ]),
          ),
          obj
        ); //?.$
        assert.deepEqual( result, { 0: 0, 2: 10, 4: 20, 6: 30, 8: 40 });
      });
    });
    describe( 'reduce', function() {
      it( 'works with a seq, compose', () => {
        const obj = [...Array( 10 ).keys()].reduce(( acc, curr ) => { acc[curr] = curr; return acc ; }, {});
        const result = seq(
          compose(
            filter(([ , value ]) => value % 2 === 0 ),
            map(([ key, value ]) => [ key, value * 10 ]),
            map(([ key, value ]) => [ key, value / 2 ]),
            reduce(( accumulate, [ , value ]) => accumulate + value, 0 ),
          ),
          obj
        ); //?.$
        assert.equal( result, 100 );
      });
    });
    describe( 'into', function() {
      it( 'Adds the processed elements into another object', () => {
        const obj = { a:1, b:2, c:3, d:4 };
        const result = into({},
          compose(
            filter(([ , value ]) => value % 2 === 0 ),
            map(([ key, value ]) => [ key, value * 10 ]),
            map(([ key, value ]) => [ key, value / 2 ]),
          ),
          obj
        );
        assert.deepEqual( result, { b: 10, d: 20 });
      });
    });
  });
});