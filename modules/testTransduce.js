const { assoc } = require( './objects.js' );
const { I, isObject, isArray } = require( './functions.js' );

//*******************************************
// utils
//*******************************************

const init = obj => obj['@@transducer/init'] || obj.init;
const step = obj => obj['@@transducer/step'] || obj.step;
const value = obj => obj['@@transducer/value'] || obj.value;
const result = obj => obj['@@transducer/result'] || obj.result;

const StandardReducer = ( description ) => ({
  'init': description.init || description['@@tranducer/init'],
  'step': description.step || description['@@tranducer/step'],
  'value': description.value || description['@@tranducer/value'],
  'result': description.result || description['@@tranducer/result'],    
  '@@tranducer/init': description['@@tranducer/init'] || description.init,
  '@@tranducer/step': description['@@tranducer/step'] || description.step,
  '@@tranducer/value': description['@@tranducer/value'] || description.value,
  '@@tranducer/result': description['@@tranducer/result'] || description.result,
});

const Reduced = ( value ) => ({
  '@@transducer/reduced': true,
  '@@transducer/value': value
});

const isReduced = ( x ) => x && x['@@transducer/reduced'];

const ObjectIterator = obj => {
  const keys = Object.keys( obj );
  let index = 0;
  return {
    next: () => {
      index < keys.length ? ++index && {
        value: [ keys[index], obj[keys[index]] ],
        done: false
      } : { done : true };
    }
  };
};

const getIterator = ( collection ) => {
  if ( collection[Symbol.iterator]) return collection[Symbol.iterator]();
  if ( isObject( collection )) return ObjectIterator( collection );
  throw new Error( `Transducers: No Iterator for collection: ${collection}` );
};

const defaultReducerProps = reducer => ({
  '@@transducer/init': ( ...args ) => init( reducer )( ...args ),
  '@@transducer/result': ( ...args ) => result( reducer )( ...args )
});

//*******************************************
// Reducer types
//*******************************************
const MapReducer = ( fn, reducer ) => ({
  ...defaultReducerProps( reducer ),
  '@@transducer/step': ( acc, curr ) => step( reducer )( acc, fn( curr )),
});

const FilterReducer = ( predicate, reducer ) => ({
  ...defaultReducerProps( reducer ),
  '@@transducer/step': ( acc, curr ) => predicate( curr ) ? step( reducer )( acc, curr ) : acc,
});

const ReduceReducer = ( fn, init, reducer ) => ({
  ...defaultReducerProps( reducer ),
  '@@transducer/result': () => init,
  '@@transducer/step': ( acc, curr ) => {
    init = fn( init, curr );
    return step( reducer )( acc, curr );
  },
});

const ArrayReducer = ()=>({
  '@@transducer/init': ( ...args ) => [...args],
  '@@transducer/result': I,
  '@@transducer/step': ( array, value ) => { array.push( value ); return array ; },
});

const ObjectReducer = ()=>({
  '@@transducer/init': ( args ) => args || {},
  '@@transducer/result': I,
  '@@transducer/step': ( object, value ) => 
    isArray( value ) && value.length === 2 ? assoc( ...value, object ) : Object.keys( value ).forEach( k=> assoc( k, value[k], object )),
});

//*******************************************
// transformers
//*******************************************
const map = fn => reducer => MapReducer( fn, reducer );
const reduce = ( fn, init ) => reducer => ReduceReducer( fn, init, reducer );
const filter = predicate => reducer => FilterReducer( predicate, reducer );

// Functions
const transduce = ( xf , reducer, initialValue, collection ) => {
  if ( !collection ) return ( coll ) => transduce( xf, reducer, initialValue, coll ); 
  if ( !initialValue ) initialValue = ( init( xf ))(); 
  const transformedReducer = xf( reducer );
  let accumulation = initialValue;
  const iter = getIterator( collection );
  let val = iter.next();
  while( !val.done ) {
    accumulation = step( transformedReducer )( accumulation, val.value );
    if( isReduced( accumulation )) {
      accumulation = value( accumulation );
      break;
    }
    val = iter.next();
  }
  return result( transformedReducer )( accumulation );
};

const into = ( to, xf, collection ) => {
  if ( !collection ) return coll => into( to, xf, coll );
  if ( !xf || !collection ) throw new Error( 'transform function and collection must be present' );
  return transduce( xf, isArray( to ) ? ArrayReducer() : ObjectReducer(), to, collection );
};

const seq = ( xf, collection ) => {
  if ( !collection ) return coll => seq( xf, coll );
  return into( isArray( collection ) ? [] : {}, xf, collection );
};

// TODO: Probar un transduce con stream
// TODO: Hacer un Bbenchmark contra transducers.js
// TODO: Asegurar que funciona contra immutable y que no se creen listas nuevas

//*******************************************
// Public Interface
//*******************************************

module.exports = {
  // utils
  Reduced,
  isReduced,
  // transformers
  map,
  filter,
  reduce,
  // functions
  transduce,
  into,
  seq
};
