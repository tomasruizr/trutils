const { createNew } = require( './index' );
const assert = require( 'assert' );

function F1( param ) {
  this.paramF1 = param;
}
F1.prototype.F1Function = function() {
  return ( `F1 ${this.paramF1}` );
};
function F2( param ) {
  this.paramF2 = param;
}
F2.prototype.F2Function = function() {
  return ( `F2 ${this.paramF2}` );
};

let P1 = {
  P1Function(){
    return ( 'P1' );
  }
};
let P2 = {
  P2Function(){
    return ( 'P2' );
  }
};

class C1{
  constructor( param ){
    this.paramC1 = param;
  }
  C1Function(){
    return ( `C1 ${this.paramC1}` );
  }
}

class C2{
  constructor( param ){
    this.paramC2 = param;
  }
  C2Function(){
    return ( `C2 ${this.paramC2}` );
  }
}

describe( 'createNew', function() {
  it( 'creates an instance of a class', () => {
    let c = createNew( C1 );
    assert( c );
    assert( c.C1Function );
    assert.equal( c.C1Function(), 'C1 undefined' );
  });
  it( 'creates an instance of a function', function () {
    let f = createNew( F1 );
    assert( f );
    assert( f.F1Function );
    assert.equal( f.F1Function(), 'F1 undefined' );
  }
  );
  it( 'creates an instance of an object or prototype', function(){
    let p = createNew( P1 );
    assert( p );
    assert( p.P1Function );
    assert.equal( p.P1Function(), 'P1' );
  });
  it( 'creates an instance of a class with params for the constructor', function(){
    let c = createNew( C1, 'clase' );
    assert( c );
    assert.equal( c.C1Function(), 'C1 clase' );
  });
  it( 'creates an instance of a function with params for the constructor', function(){
    let f = createNew( F1, 'function' );
    assert( f );
    assert.equal( f.F1Function(), 'F1 function' );
  });
  it( 'creates a compose object of 2 clases', function(){
    let c = createNew([ C1, C2 ], { C1:'clase1', C2:'clase2' });
    assert( c );
    assert( c.C1Function );
    assert( c.C2Function );
    assert.equal( c.C1Function(), 'C1 clase1' );
    assert.equal( c.C2Function(), 'C2 clase2' );
  });
  it( 'creates a compose object of 2 functions', function(){
    let f = createNew([ F1, F2 ], { F1:'function1', F2:'function2' });
    assert( f.F1Function );
    assert( f.F2Function );
    assert.equal( f.F1Function(), 'F1 function1' );
    assert.equal( f.F2Function(), 'F2 function2' );
  });
  it( 'creates a compose object of 2 prototypes', function () {
    let p = createNew([ P1, P2 ]);
    assert( p );
    assert( p.P1Function );
    assert( p.P2Function );
    assert.equal( p.P1Function(), 'P1' );
    assert.equal( p.P2Function(), 'P2' );
  });
  it( 'creates a compose object of a class and a function', function(){
    let c = createNew([ C1, F1 ], { C1:'class1', F1:'function1' });
    assert( c );
    assert( c.C1Function );
    assert.equal( c.C1Function(), 'C1 class1' );
    assert( c.F1Function );
    assert.equal( c.F1Function(), 'F1 function1' );
  });
  it( 'creates a compose object of 2 class and an object', function () {
    let c = createNew([ C1, P1 ], { C1:'class1' });
    assert( c );
    assert( c.C1Function );
    assert.equal( c.C1Function(), 'C1 class1' );
    assert( c.P1Function );
    assert.equal( c.P1Function(), 'P1' );
  });
  it( 'creates a compose object of 2 function and an object', function(){
    let c = createNew([ F1, P1 ], { F1:'function1' });
    assert( c );
    assert( c.F1Function );
    assert.equal( c.F1Function(), 'F1 function1' );
    assert( c.P1Function );
    assert.equal( c.P1Function(), 'P1' );
  });
  it( 'creates a compose object of multiples mixtures', function(){
    let c = createNew([ F1, P1, C1, C2 ], { F1:'function1', C2:'clase2' });
    assert( c );
    assert( c.F1Function );
    assert.equal( c.F1Function(), 'F1 function1' );
    assert( c.P1Function );
    assert.equal( c.P1Function(), 'P1' );
    assert( c.C1Function );
    assert( c.C2Function );
    assert.equal( c.C1Function(), 'C1 undefined' );
    assert.equal( c.C2Function(), 'C2 clase2' );
  });
  it( 'throws an error if params are not object protoname-based', function(){
    try {
      createNew([ C1, C2 ], 'clase' );
    } catch ( e ) {
      assert( e );
      assert.equal( e.message, 'Arguments should be an object protoname-based for each prototype' );
    }
  });
});

