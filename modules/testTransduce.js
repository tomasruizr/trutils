// const { assoc } = require( './objects.js' );
const { I, isObject } = require( './functions.js' );

//*******************************************
// utils
//*******************************************

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

//*******************************************
// Reducer types
//*******************************************
const MapReducer = ( fn, reducer ) => ({
  '@@transducer/init': ( ...args ) => reducer['@@transducer/init']( ...args ),
  '@@transducer/result': ( ...args ) => reducer['@@transducer/result']( ...args ),
  '@@transducer/step': ( acc, curr ) => reducer['@@transducer/step']( acc, fn( curr )),
});

const FilterReducer = ( predicate, reducer ) => ({
  '@@transducer/init': ( ...args ) => reducer['@@transducer/init']( ...args ),
  '@@transducer/result': ( ...args ) => reducer['@@transducer/result']( ...args ),
  '@@transducer/step': ( acc, curr ) => predicate( curr ) && reducer['@@transducer/step']( acc, curr ),
});

const ArrayReducer = ()=>({
  '@@transducer/init': ( ...args ) => [...args],
  '@@transducer/result': I,
  '@@transducer/step': ( array, value ) => { array.push( value ); return array ; },
});

// const ObjectReducer = ()=>({
//   '@@transducer/init': ( args ) => args || {},
//   '@@transducer/result': I,
//   '@@transducer/step': ( object, value ) => 
//     isArray( value ) && value.length === 2 ? assoc( ...value, object ) : Object.keys( value ).forEach( k=> assoc( k, value[k], object )),
// });

//*******************************************
// transformers
//*******************************************
const map = fn => reducer => MapReducer( fn, reducer );
const filter = predicate => reducer => FilterReducer( predicate, reducer );

// Functions
const transduce = ( xf , reducer, initialValue, collection ) => {
  if ( !initialValue ) initialValue = xf['@@transducer/init'](); 
  if ( !collection ) return ( coll ) => transduce( xf, reducer, initialValue, coll ); 
  const transformedReducer = xf( reducer );
  let accumulation = initialValue;
  const iter = getIterator( collection );
  let val = iter.next();
  while( !val.done ) {
    accumulation = transformedReducer['@@transducer/step']( accumulation, val.value );
    if( isReduced( accumulation )) {
      accumulation = accumulation['@@transducer/value'];
      break;
    }
    val = iter.next();
  }
  return transformedReducer['@@transducer/result']( accumulation );
};

// TODO: Traer seq, into
// TODO: Probar un transduce con stream
// TODO: Hacer un Benchmark contra transducers.js
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
  // functions
  transduce
};
