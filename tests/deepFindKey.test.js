const { deepFindKey } = require( '../index' );
const {assert} = require( 'chai' );

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

describe('deepFindKey', function() {
  it('accepts curring', () => {
    const res = deepFindKey("a");
    assert.isFunction(res);
    const result = res(obj);
    assert.equal(result, "nivel 1");
  });
  it('gets an element at root level', function() {
    const res = deepFindKey("a", obj);
    assert.equal(res, "nivel 1");
  });
  it('gets an element at a nested level', () => {
    const res = deepFindKey("c", obj);
    assert.equal(res, "nivel 2");
  })
  it('gets an element at three nested level', () => {
    const res = deepFindKey("g", obj);
    assert.equal(res, "nivel 4");
  })
  it('gets an element at three nested array', () => {
    const res = deepFindKey("data3", obj);
    assert.equal(res, "3");
  })
  
});