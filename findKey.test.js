const { findKey } = require( './index' );
const assert = require( 'assert' );

let obj = {
  arr: [{
      data1: 1,
      data2: 2,
      arr2: ["a","b","c"]
    },{
      data3: 3,
      data4: 4
    }
  ],
  a: "nivel 1",
  b: {
    c: "nivel 2",
    d: {
      e: "nivel 3",
      f: {
        g: "nivel 4"
      }
    }
  }
}

describe('findKey', function() {
  it('gets an element at root level', function() {
    const res = findKey(obj, "a");
    assert.equal(res, "nivel 1");
  });
  it('gets an element at a nested level', () => {
    const res = findKey(obj, "c");
    assert.equal(res, "nivel 2");
  })
  it('gets an element at three nested level', () => {
    const res = findKey(obj, "g");
    assert.equal(res, "nivel 4");
  })
  it('gets an element at three nested array', () => {
    const res = findKey(obj, "data3");
    assert.equal(res, "3");
  })
  
});