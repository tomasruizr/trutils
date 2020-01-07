const { measureTime, compareTimes } = require( './benchmarks.js' );
const { assert } = require( 'chai' );

describe( 'measureTimes', function() {
  it( 'returns a diference in milisecons for an execution', () => {
    const now = new Date().valueOf();
    const result = measureTime(() => {
    // eslint-disable-next-line no-empty
      while ( new Date().valueOf() < now + 20 ){}
    });
    assert.closeTo( result, 20, 5 );
  });
});

describe( 'compareTimes', function() {
  it( 'returns an object with the title as property', () => {
    const result = compareTimes( 'bla', []);//?
    assert.isObject( result );
    assert.exists( result.bla );
  });
  it( 'has an object with a property for each index when functions is array in the Property with the title name ', () => {
    const result = compareTimes( 'bla', [() => {}]);//?
    assert.exists( result.bla[0]);
  });
  it( 'has an object with a property for index 0 when functions is a function ', () => {
    const result = compareTimes( 'bla', () => {});//?
    assert.exists( result.bla[0]);
  });
  it( 'has an object with a property for each property when functions is an object in the Property with the title name', () => {
    const result = compareTimes( 'bla', { a:() => {} });//?
    assert.exists( result.bla['a']);
  });
  it( 'has avalue as string with the duration in milliseconds for each function', () => {
    const result = compareTimes( 'bla', { a:() => {}, b:() => {} });//?
    assert.isTrue( /\d+ms/.test( result.bla['a']));
    assert.isTrue( /\d+ms/.test( result.bla['b']));
  });
});