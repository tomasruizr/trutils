const { omit, clone, pick, prop, assoc, propPath, assocPath, merge, mergeClone, fromPairs, appendDeep } = require( './objects.js' );
const { assert } = require( 'chai' );

describe( 'objects', function() {
  describe( 'prop', function() {
    const obj = {
      a: 23,
      bla:{
        b:{
          c:'hello'
        },
        arr:[
          {
            name:'nombre'
          }
        ]
      }
    };
    it( 'calls gets the prop passed as param', () => {
      const result = prop( 'a', obj );
      assert.equal( result, 23 );
    });
    it( 'Accepts curried params', () => {
      const result = prop( 'a' );
      assert.isFunction( result );
      assert.equal( result( obj ), 23 );
    });
  });

  describe( 'assoc', function() {
    let obj;
    beforeEach(() => {
      obj = {
        a:{
          b:{
            c:'hello'
          }
        }
      };
    });
    it( 'calls sets the prop with the value and returns the object', () => {
      assoc( 'a', 4, obj );
      assert.deepEqual({ a: 4 }, obj );
    });
    it( 'Accepts curried params', () => {
      const res = assoc( 'b', 5 );
      assert.isFunction( res );
      res( obj );
      assert.deepEqual( obj, { a:{ b:{ c:'hello' }}, b:5 });
    });
  });

  describe( 'propPath', function() {
    const obj = {
      a:{
        b:{
          c:'hello'
        },
        arr:[
          {
            name:'nombre'
          }
        ]
      }
    };
    it( 'calls mGet when all the params are passed', () => {
      const result = propPath([ 'a','b','c' ], obj );
      assert.equal( result, 'hello' );
    });
    it( 'Accepts curried params', () => {
      const res = propPath([ 'a','b','c' ]);
      assert.isFunction( res );
      const result = res( obj );
      assert.equal( result, 'hello' );
    });
    it( 'Accepts curried params for array', () => {
      const res = propPath([ 'a','arr', '0','name' ]);
      assert.isFunction( res );
      const result = res( obj );
      assert.equal( result, 'nombre' );
    });
    it( 'returns undefined if any part of the path does not exist', () => {
      const result = propPath([ 'a', 'does not exists', 'this one either' ]);
      assert.isFunction( result );
      assert.isUndefined( result( obj ));
    });
  });
  describe( 'assocPath', function() {
    const obj = {
      a:{
        b:{
          c:'hello'
        }
      }
    };
    it( 'calls mSet when all the params are passed', () => {
      assocPath([ 'a','b','d' ], 4, obj );
      assert.deepEqual({ a:{ b:{ c:'hello', d:4 }}}, obj );
    });
    it( 'Accepts curried params', () => {
      const res = assocPath([ 'a','b','d' ], 5 );
      assert.isFunction( res );
      res( obj );
      assert.deepEqual( obj, { a:{ b:{ c:'hello', d:5 }}});
    });
    it( 'Accepts curried params', () => {
      const res = assocPath([ 'a','d','b','d' ], 5 );
      assert.isFunction( res );
      res( obj );
      assert.deepEqual( obj, { a: { b: { c: 'hello', d: 5 }, d: { b: { d: 5 }}}});
    });
  });
  describe( 'mergeClone', function() {
    it( 'generates a curried function when no source supplied', () => {
      const m = mergeClone({ a:'tomas' });
      const result = m({ b:'ruiz' });
      assert.deepEqual( result, { a:'tomas', b:'ruiz' });
    });
    it( 'deleting works', () => {
      const state = { prop: true, other: true, deep: { prop: 'foo' }};
      const newState = mergeClone({
        prop: undefined,
        deep: { prop: undefined },
        fake: undefined, // deleting non existent key
        other: null
      }, state );
      assert.deepEqual( state, { prop: true, other: true, deep: { prop: 'foo' }});
      assert.deepEqual( newState, { other: null, deep: {}});
    });
    it( 'deleting works with arrays', () => {
      const state = { foo: 'bar', deep: { arr: [ 1, 2, 3 ], prop: false }};
      const newState = mergeClone({ deep: { arr: { 1: undefined }}}, state );
      assert.notEqual( state.deep, newState.deep );
      assert.notEqual( state.deep.arr, newState.deep.arr );
      assert.deepEqual( newState.deep.arr, [ 1, 3 ]);
    });
    it( 'function sub works', () => {
      const state = { age: 10, name: 'bob', obj: { prop: true }};
      const newState = mergeClone({
        age: x => x * 10,
        obj: () => ({ replaced: true }),
        name: ( x, m ) => {
          assert.equal( m, mergeClone ); // verify that merge is passed as second arg
          return x;
        }
      }, state );
      assert.deepEqual( newState, { age: 100, name: 'bob', obj: { replaced: true }});
      assert.deepEqual( state, { age: 10, name: 'bob', obj: { prop: true }});
    });
    it( 'deep function sub to uncreated object path', () => {
      const state = { orig: true };
      const newState = mergeClone({
        add: { stats: { count: x => ( x == null ? 1 : x + 1 ) }}
      }, state );
      assert.deepEqual( newState, { orig: true, add: { stats: { count: 1 }}});
      assert.deepEqual( state, { orig: true });
    });
    it( 'add nested object', () => {
      const state = { age: 10 };
      const add = { sub: true };
      const newState = mergeClone({ add }, state );
      assert.deepEqual( newState, { age: 10, add: { sub: true }});
      assert.notEqual( newState.add, add );
      assert.notEqual( state, newState );
    });
    it( 'deep merge objects', () => {
      const state = { age: 10, sub: { sub: { prop: true }}};
      const newState = mergeClone({ sub: { sub: { newProp: true }}}, state );
      assert.deepEqual( state, { age: 10, sub: { sub: { prop: true }}});
      assert.deepEqual( newState, { age: 10, sub: { sub: { prop: true, newProp: true }}});
      assert.notEqual( newState, state );
      assert.notEqual( newState.sub, state.sub );
      assert.notEqual( newState.sub.sub, state.sub.sub );
    });
    it( 'function patch', () => {
      const state = { age: 10, foo: 'bar' };
      const newState = mergeClone(( s ) => {
        assert.notEqual( s, state );
        assert.deepEqual( s, state );
        return mergeClone( s, { prop: true });
      }, state );
      assert.deepEqual( newState, { age: 10, foo: 'bar', prop: true });
    });
    it( 'function patch that replaces', () => {
      const state = { age: 10, foo: 'bar' };
      const newState = mergeClone(( s ) => {
        assert.notEqual( s, state );
        assert.deepEqual( s, state );
        return { name:'tomas' };
      }, state );
      assert.deepEqual( newState, { name:'tomas' });
    });
    it( 'returns original state if patch is no object, array or function', () => {
      const state = { age: 10, foo: 'bar' };
      let newState = mergeClone( 1, state );
      assert.deepEqual( newState, { age: 10, foo: 'bar' });
      newState = mergeClone( undefined, state );
      assert.deepEqual( newState, { age: 10, foo: 'bar' });
      newState = mergeClone( null, state );
      assert.deepEqual( newState, { age: 10, foo: 'bar' });
      //TODO: this should be equal.
      assert.notEqual( state, newState );
    });
    it( 'deep merge with arr', () => {
      const state = { foo: 'bar', deep: { arr: [ 1, 2, 3 ], prop: false }};
      const newState = mergeClone({ deep: { arr: { 1: 20 }}}, state );
      assert.notEqual( state.deep, newState.deep );
      assert.notEqual( state.deep.arr, newState.deep.arr );
      assert.deepEqual( newState.deep.arr, [ 1, 20, 3 ]);
      assert.deepEqual( state.deep.arr, [ 1, 2, 3 ]);
    });
    it( 'top level SUB', () => {
      const state = { age: 20, foo: 'bar' };
      const replacement = { replaced: true };
      const newState = mergeClone(() => replacement, state );
      assert.notEqual( state, newState );
      assert.equal( newState, replacement );
    });
    it( 'reuse object if same ref when patching', () => {
      const state = { deep: { prop: true }};
      const newState = mergeClone({ deep: state.deep }, state );
      assert.notEqual( state, newState ); // TODO: maybe try and be smarter, to avoid copy if patch changes nothing
      assert.equal( newState.deep, state.deep );
    });
    it( 'multi function patch, only copy once', () => {
      const copies = [];
      mergeClone( Array.from({ length: 5 }, () => state => ( copies.push( state ), state )), { key: 'value' });
      assert.equal( copies.length, 5 );
      assert.equal( typeof copies[0], 'object' );
      copies.every( copy => assert.equal( copy, copies[0]));
    });
    it( 'replace primitive with object and vice versa', () => {
      const state = { count: 10, foo: { prop: true }};
      const newState = mergeClone({ count: { prop: true }, foo: 10 }, state );
      assert.deepEqual( state, { count: 10, foo: { prop: true }});
      assert.deepEqual( newState, { count: { prop: true }, foo: 10 });
    });
  });

  describe( 'merge', function() {
    it( 'generates a curried function when no source supplied', () => {
      const m = merge({ a:'tomas' });
      const result = m({ b:'ruiz' });
      assert.deepEqual( result, { a:'tomas', b:'ruiz' });
    });
    it( 'deleting works', () => {
      const state = { prop: true, other: true, deep: { prop: 'foo' }};
      const newState = merge({
        prop: undefined,
        deep: { prop: undefined },
        fake: undefined, // deleting non existent key
        other: null
      }, state );
      assert.equal( newState, state );
      assert.deepEqual( state, { other: null, deep: {}});
    });
    it( 'function sub works', () => {
      const state = { age: 10, name: 'bob', obj: { prop: true }};
      const newState = merge({
        age: x => x * 10,
        obj: () => ({ replaced: true }),
        name: ( x, m ) => {
          assert.equal( m, merge ); // verify that merge is passed as second arg
          return x;
        }
      }, state );
      assert.equal( newState, state );
      assert.deepEqual( state, { age: 100, name: 'bob', obj: { replaced: true }});
      assert.equal( newState, state );
    });
    it( 'deep function sub to uncreated object path', () => {
      const state = { orig: true };
      const newState = merge({
        add: { stats: { count: x => ( x == null ? 1 : x + 1 ) }}
      }, state );
      assert.deepEqual( state, { orig: true, add: { stats: { count: 1 }}});
      assert.equal( newState, state );
    });
    it( 'add nested object', () => {
      const state = { age: 10 };
      const add = { sub: true };
      const newState = merge({ add }, state );
      assert.deepEqual( state, { age: 10, add: { sub: true }});
      assert.notEqual( newState.add, add );
      assert.equal( newState, state );
    });
    it( 'deep merge objects', () => {
      const state = { age: 10, sub: { sub: { prop: true }}};
      const newState = merge({ sub: { sub: { newProp: true }}}, state );
      assert.deepEqual( state, { age: 10, sub: { sub: { prop: true, newProp: true }}});
      assert.equal( newState, state );
      assert.equal( newState.sub, state.sub );
      assert.equal( newState.sub.sub, state.sub.sub );
    });
    it( 'function patch', () => {
      const state = { age: 10, foo: 'bar' };
      merge(( s ) => {
        assert.equal( s, state );
        assert.deepEqual( s, state );
        return merge( s, { prop: true });
      }, state );
    });
    it( 'deep merge with arr', () => {
      const state = { foo: 'bar', deep: { arr: [ 1, 2, 3 ], prop: false }};
      const newState = merge({ deep: { arr: { 1: 20 }}}, state );
      assert.equal( state.deep, newState.deep );
      assert.equal( state.deep.arr, newState.deep.arr );
      assert.deepEqual( state.deep.arr, [ 1, 20, 3 ]);
    });
    it( 'top level SUB', () => {
      const state = { age: 20, foo: 'bar' };
      const replacement = { replaced: true };
      const newState = merge(() => replacement, state );
      assert.notEqual( state, newState );
      assert.equal( newState, replacement );
    });
    it( 'reuse object if same ref when patching', () => {
      const state = { deep: { prop: true }};
      const newState = merge({ deep: state.deep }, state );
      assert.equal( state, newState ); // TODO: maybe try and be smarter, to avoid copy if patch changes nothing
      assert.equal( newState.deep, state.deep );
    });
    it( 'multi function patch, only copy once', () => {
      const copies = [];
      merge( Array.from({ length: 5 }, () => state => ( copies.push( state ), state )), { key: 'value' });
      assert.equal( copies.length, 5 );
      assert.equal( typeof copies[0], 'object' );
      copies.every( copy => assert.equal( copy, copies[0]));
    });
    it( 'replace primitive with object and vice versa', () => {
      const state = { count: 10, foo: { prop: true }};
      merge({ count: { prop: true }, foo: 10 }, state );
      assert.deepEqual( state, { count: { prop: true }, foo: 10 });
    });
  });
  
  describe( 'pick', function() {
    it( 'picks a list of properties from an object', () => {
      const obj = {
        name: 'tomas',
        lastName: 'Ruiz',
        friends: [ 'mary', 'andy' ],
        born: 'Venezuela',
        address: {
          city:'BA',
          country: 'Argentina'
        }
      };
      assert.deepEqual( pick([ 'name', 'lastName', [ 'address','country' ]], obj ), { 
        address: { 
          country: 'Argentina' 
        },
        lastName: 'Ruiz',
        name: 'tomas' });//?
    });  
    
    it( 'Works with array', () => {
      const arr = [ 1,2,3,4 ];
      assert.deepEqual( pick([ 0,1 ], arr ), [ 1,2 ]);  
    });
    it( 'picks only data not null or undefined', () => {
      const obj = { a:1, b:undefined, c:null };
      assert.deepEqual( pick([ 'a','b','c' ], obj ), { a:1 });  
    });
  });

  describe( 'omit', function() {
    it( 'omits a list of properties from an object', () => {
      const obj = {
        name: 'tomas',
        lastName: 'Ruiz',
        friends: [ 'mary', 'andy' ],
        born: 'Venezuela',
        address: {
          city:'BA',
          country: 'Argentina'
        }
      };
      assert.deepEqual( omit([ 'born', 'friends', 'lastName' ], obj ), { 
        address: { 
          city:'BA',
          country: 'Argentina' 
        },
        name: 'tomas' });//?
    });  
    it( 'omits a list of properties from an object [curried]', () => {
      const obj = {
        name: 'tomas',
        lastName: 'Ruiz',
        friends: [ 'mary', 'andy' ],
        born: 'Venezuela',
        address: {
          city:'BA',
          country: 'Argentina'
        }
      };
      const o = omit([ 'born', 'friends', 'lastName' ]);
      assert.deepEqual( o( obj ), { 
        address: { 
          city:'BA',
          country: 'Argentina' 
        },
        name: 'tomas' });//?
    });  
  });

  describe( 'clone', function() {
    it( 'shallow clones an object', () => {
      const obj = { name:'tomas' };
      assert.notEqual( obj, clone( obj ));
      assert.deepEqual( obj, clone( obj ));
    });
    it( 'deep clones an object', () => {
      const obj = { name:'tomas', address:{ city:'Buenos Aires' }, friends:[ 'mary', 'andy' ], birthday: new Date( '10/18/1984' ) };
      assert.notEqual( obj, clone( obj ));
      assert.notEqual( obj.address, clone( obj ).address );
      assert.notEqual( obj.friends, clone( obj ).friends );
      assert.notEqual( obj.birthday, clone( obj ).birthday );
      assert.deepEqual( obj, clone( obj ));
    });
    it( 'deep clones an array', () => {
      const arr = [{ name:'tomas', address:{ city:'Buenos Aires' }}, [ 1,2,3,4 ], 'algun string', new Date( '10/18/1984' ) ];
      assert.notEqual( arr, clone( arr ));
      assert.notEqual( arr[0].address, clone( arr )[0].address );
      assert.notEqual( arr[1], clone( arr )[1]);
      assert.equal( arr[2], clone( arr )[2]);
      assert.notEqual( arr[3], clone( arr )[3]);
      assert.deepEqual( arr, clone( arr ));
    });
    it( 'clones a time', () => {
      const date = new Date();
      assert.notEqual( date, clone( date ));
      assert.deepEqual( date, clone( date ));
    });
  });
  describe( 'fromPairs', function() {
    it( 'converts an arrays of pairs into an object', () => {
      assert.deepEqual( fromPairs([]), {});
      assert.deepEqual( fromPairs([[ 'name', 'tomas' ]]), { name:'tomas' });
      assert.deepEqual( fromPairs([[ 'name', 'tomas' ], [ 'lastName', 'ruiz' ]]), { name:'tomas', lastName:'ruiz' });
    });
  });
  describe( 'appendDeep', function() {
    it( 'pushes the value into a deep array and return the array', () => 
      assert.deepEqual( appendDeep(['2'], 5, [ 1,2, [ 3,4 ]]) , [ 1,2 ,[ 3,4,5 ]]));
    it( 'pushes the value into a deep array and return the array', () => 
      assert.deepEqual( appendDeep([ 2, 'data','numbers' ], 'some name', [ 1,2, { data:{ numbers:[]}}]) , [ 1, 2, { data: { numbers: ['some name']}}]));
    it( 'pushes the value into a deep array and return the array', () => 
      assert.deepEqual( appendDeep(['roles'], 'some role', { roles:['bla']}) , { roles: [ 'bla', 'some role' ]}));
    it( 'Curried pushes the value into an array and return the array', () => {
      const fn = appendDeep(['2'], 5 );
      assert.deepEqual( fn([ 1,2, [ 3,4 ]]) , [ 1,2 ,[ 3,4,5 ]]);
    });
  });
});