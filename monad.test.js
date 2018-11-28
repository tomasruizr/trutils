const { mGet, mSet, mExists } = require( './index' );
const assert = require( 'assert' );

let obj = {
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
    try{
      mGet(["sf"]);
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

describe('mGet by string', function() {
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
});