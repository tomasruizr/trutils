const { mGet, mSet, mExists } = require( './index' );
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
      },
      h: null
    }
  },
  c: null
}

let arr = ['asdf', 1, true, obj]

describe('validateParams', () => {
  it('throws error if first argument is not an object', () => {
    try{
      mGet();
    } catch (e){
      assert.equal(e.message,"The first argument must be an object");
    }
    try{
      mGet(4);
    } catch (e){
      assert.equal(e.message,"The first argument must be an object");
    }
    try{
      mGet("sf");
    } catch (e){
      assert.equal(e.message,"The first argument must be an object");
    }
  });

  it('throws error if second argument is not an array or string', () => {
    try{
      mGet(obj, 3);
    } catch (e){
      assert.equal(e.message, `The object Path must be a string in the format 'x.y.z' or an array ['x','y','z']`);
    }
    try{
      mGet(obj, {});
    } catch (e){
      assert.equal(e.message, `The object Path must be a string in the format 'x.y.z' or an array ['x','y','z']`);
    }
  });
})

describe('mGet of null object', function() {
	it('returns the falsy value of object', () => {
		assert.equal(mGet(undefined, 'a'), undefined);
		assert.equal(mGet(null, 'a'), null);
	});
});

describe('mGet by string', function() {
  it('gets the level 1 values', ()=>{
    assert.equal(mGet(obj, "a"), "nivel 1");
  });
  it('gets the level 2 values', ()=>{
    assert.equal(mGet(obj, "b.c"), "nivel 2");
  });
  it('gets the level 3 values', ()=>{
    assert.equal(mGet(obj, "b.d.e"), "nivel 3");
  });
  it('gets the level 4 values', ()=>{
    assert.equal(mGet(obj, "b.d.f.g"), "nivel 4");
  });
});

describe('mGet when value is null and parts is not empty', function() {
  it('gets the level 1 values', ()=>{
    assert.equal(mGet(obj, "c.x.x"), null);
  });
  it('gets the level 3 values', ()=>{
    assert.equal(mGet(obj, "b.d.h.x"), null);
  });
});

describe('mGet by array', function() {
  it('gets the level 1 values', ()=>{
    assert.equal(mGet(obj, ["a"]), "nivel 1");
  });
  it('gets the level 2 values', ()=>{
    assert.equal(mGet(obj, ["b","c"]), "nivel 2");
  });
  it('gets the level 3 values', ()=>{
    assert.equal(mGet(obj, ["b","d","e"]), "nivel 3");
  });
  it('gets the level 4 values', ()=>{
    assert.equal(mGet(obj, ["b","d","f","g"]), "nivel 4");
  });
});

describe('mGet by string nested array of objects', function() {
  it('gets the objects inside of array', () => {
    assert.equal(mGet(obj, "arr.0.data1"), 1);
    assert.equal(mGet(obj, "arr.0.data2"), 2);
    assert.equal(mGet(obj, "arr.1.data3"), 3);
    assert.equal(mGet(obj, "arr.1.data4"), 4);
  })
});

describe('mGet by string nested array of array', function() {
  it('gets the objects inside of array', () => {
    assert.deepEqual(mGet(obj, "arr.0.arr2"), ["a","b","c"]);
  })
});

describe('mGet - Arrays', function() {
  it('gets an index from an array including nested objects', () => {
    assert.equal(mGet(arr, "0"), 'asdf');
    assert.equal(mGet(arr, "1"), 1);
    assert.equal(mGet(arr, "2"), true);
    assert.equal(mGet(arr, "3.arr.0.data1"), 1);
    assert.equal(mGet(arr, "3.arr.0.data2"), 2);
    assert.equal(mGet(arr, "3.arr.1.data3"), 3);
    assert.equal(mGet(arr, "3.arr.1.data4"), 4);
    assert.equal(mGet(arr, "3.a"), "nivel 1");
    assert.equal(mGet(arr, "3.b.c"), "nivel 2");
    assert.equal(mGet(arr, "3.b.d.e"), "nivel 3");
    assert.equal(mGet(arr, "3.b.d.f.g"), "nivel 4");
  });
  
});


describe('mExists by string', function() {
  it('gets the level 1 values', ()=>{
    assert.equal(mExists(obj, "a"), true);
  });
  it('gets the level 2 values', ()=>{
    assert.equal(mExists(obj, "b.c"), true);
  });
  it('gets the level 3 values', ()=>{
    assert.equal(mExists(obj, "b.d.e"), true);
  });
  it('gets the level 4 values', ()=>{
    assert.equal(mExists(obj, "b.d.f.g"), true);
  });
});

describe('mExists by string NOT EXISTS', function() {
  it('gets the level 1 values', ()=>{
    assert.equal(mExists(obj, "x"), false);
  });
  it('gets the level 2 values', ()=>{
    assert.equal(mExists(obj, "b.x"), false);
  });
  it('gets the level 3 values', ()=>{
    assert.equal(mExists(obj, "b.d.x"), false);
  });
  it('gets the level 4 values', ()=>{
    assert.equal(mExists(obj, "b.d.f.x"), false);
  });
});


describe('mSet by string', function() {
  it('Sets the level 1 values', ()=>{
    mSet(obj, "x", "new Value");
    assert.equal(obj.x, "new Value");
  });
  it('Sets the level 2 values', ()=>{
    mSet(obj, "b.x", "new Value");
    assert.equal(obj.b.x, "new Value");
  });
  it('Sets the level 3 values', ()=>{
    mSet(obj, "b.d.x", "new Value");
    assert.equal(obj.b.d.x, "new Value");
  });
  it('Sets the level 4 values', ()=>{
    mSet(obj, "b.d.f.x", "new Value");
    assert.equal(obj.b.d.f.x, "new Value");
  });
  it('Sets a new Value of false', () => {
	mSet(obj, "b.d.bool", false);
	assert.equal(obj.b.d.bool, false);
  });
  it('Returns the object', () => {
	const newObj = mSet(obj, "b.d.someProp", true);
	assert.deepEqual(obj, newObj);
  });
});

describe('mSet - cascadeInsert', function() {
  it('Deep creates a nested object structure of 1 level if does not exists', () => {
    mSet(obj, "new.val", 5);  
    assert.equal(obj.new.val, 5);
  });
  it('Deep creates a nested object structure of n level if does not exists', () => {
    mSet(obj, "new.deep.a.b.c", 5);  
    assert.equal(obj.new.deep.a.b.c, 5);
  });
});

describe('mSet - doNotCreate', function() {
	it('Do Not Deep creates a nested object structure of 1 level if does not exists', () => {
	  mSet(obj, "new.val", 5, false, true);  
	  assert.equal(obj.new.val2, undefined);
	});
	it('Deep creates a nested object structure of n level if does not exists', () => {
	  mSet(obj, "new.deep.a.b.c", 5, false, true);  
	  assert.equal(obj.new.deep.a.b.c2, undefined);
	});
  });

describe('mSet - array push', function() {
  it('Pushes to an array if the last element is an array', () => {
    mSet(obj, "arr.0.arr2", "d");  
    assert.equal(obj.arr[0].arr2.length, 4);
    assert.equal(obj.arr[0].arr2[3], "d");
  });
});

describe('mSet - arrayPush', function() {
	it('Creates and Pushes to an array if cascade create and force Array == true', () => {
	  mSet(obj, "arrNew", "newValue", true);  
	  assert.equal(Array.isArray(obj.arrNew), true);
	  assert.equal(obj.arrNew.length, 1);
	  assert.equal(obj.arrNew[0], "newValue");
	});
	it('Creates and Pushes to a nested array if cascade create and force Array == true', () => {
		mSet(obj, "arr.0.arr2.5.newObj.newArr", "newValue", true);  
		assert.equal(Array.isArray(obj.arr[0].arr2[5].newObj.newArr), true);
		assert.equal(obj.arr[0].arr2[5].newObj.newArr.length, 1);
		assert.equal(obj.arr[0].arr2[5].newObj.newArr[0], "newValue");
  });
});