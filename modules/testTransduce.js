const { assoc } = require( './objects.js' );
const { I, isObject, isArray, ensureArray } = require( './functions.js' );

//*******************************************
// utils
//*******************************************

const init = obj => obj['@@transducer/init'] || obj.init;
const step = obj => obj['@@transducer/step'] || obj.step;
const value = obj => obj['@@transducer/value'] || obj.value;
const result = obj => obj['@@transducer/result'] || obj.result;

const StandardReducer = ( description ) => ({
  'init': description.init || description['@@transducer/init'],
  'step': description.step || description['@@transducer/step'],
  'value': description.value || description['@@transducer/value'],
  'result': description.result || description['@@transducer/result'],    
  '@@transducer/init': description['@@transducer/init'] || description.init,
  '@@transducer/step': description['@@transducer/step'] || description.step,
  '@@transducer/value': description['@@transducer/value'] || description.value,
  '@@transducer/result': description['@@transducer/result'] || description.result,
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
      if ( index < keys.length ) {
        const res = {
          value: [ keys[index], obj[keys[index]] ],
          done: false
        };
        index++;
        return res;
      } else return { done : true };
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
// Transformers
//*******************************************

const ArrayReducer = ()=>StandardReducer({
  '@@transducer/init': ( ...args ) => [...args],
  '@@transducer/result': I,
  '@@transducer/step': ( array, value ) => { array.push( value ); return array ; },
});

const ObjectReducer = ()=>StandardReducer({
  '@@transducer/init': ( args ) => args || {},
  '@@transducer/result': I,
  '@@transducer/step': ( object, value ) => 
    isArray( value ) && value.length === 2 ? assoc( ...value, object ) : Object.keys( value ).forEach( k=> assoc( k, value[k], object )),
});

//*******************************************
// Reducer types
//*******************************************
const MapReducer = ( fn, reducer ) => StandardReducer({
  ...defaultReducerProps( reducer ),
  '@@transducer/step': ( acc, curr ) => step( reducer )( acc, fn( curr, acc )),
});

const FlatMapReducer = ( fn, reducer ) => StandardReducer({
  ...defaultReducerProps( reducer ),
  '@@transducer/step': ( acc, curr ) => {
    for ( const c of ensureArray( curr )) {
      const reduced = step( reducer )( acc, fn( c ));
      if ( isReduced( reduced )) return reduced;
    }
    return acc;
  },
});

const FilterReducer = ( predicate, reducer ) => StandardReducer({
  ...defaultReducerProps( reducer ),
  '@@transducer/step': ( acc, curr ) => predicate( curr, acc ) ? step( reducer )( acc, curr ) : acc,
});

const WhileReducer = ( predicate, reducer ) => StandardReducer({
  ...defaultReducerProps( reducer ),
  '@@transducer/step': ( acc, curr ) => predicate( curr, acc ) ? step( reducer )( acc, curr ) : Reduced( acc )
});

const ReduceReducer = ( fn, initial, reducer ) => StandardReducer({
  ...defaultReducerProps( reducer ),
  '@@transducer/result': () => initial,
  '@@transducer/step': ( acc, curr ) => {
    initial = fn( initial, curr, acc );
    return step( reducer )( acc, curr );
  },
});

//*******************************************
// operations
//*******************************************
const map = fn => reducer => MapReducer( fn, reducer );
const flatMap = fn => reducer => FlatMapReducer( fn, reducer );
const reduce = ( fn, init ) => reducer => ReduceReducer( fn, init, reducer );
const filter = predicate => reducer => FilterReducer( predicate, reducer );
const take = ( count = Infinity ) => reducer => WhileReducer(() => count-- > 0, reducer );
const skip = ( count = 0 ) => reducer => FilterReducer(() => count-- <= 0, reducer );
const takeUntil = ( predicate ) => reducer => WhileReducer(( value, acc ) => predicate( value, acc ), reducer );
const dedupe = ( allValues = false, lastValue ) => reducer => FilterReducer(( value, acc ) => {
  let notDuped;
  if ( !allValues ){
    notDuped = value !== lastValue;
    lastValue = value;
  } else {
    notDuped = !( Array.isArray( acc ) ? acc : Object.values( acc )).includes( value );
  } 
  return notDuped;
}, reducer );
const skipWhile = ( predicate, state = false ) => reducer => FilterReducer(( value, acc ) => {
  if ( !state ) 
    return state = !predicate( value, acc );
  return true;
}, reducer );


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
  return transduce( xf, isArray( to ) ? ArrayReducer() : ObjectReducer(), to, collection );
};

const seq = ( xf, collection ) => {
  if ( !collection ) return coll => seq( xf, coll );
  return into( isArray( collection ) ? [] : {}, xf, collection );
};

//*******************************************
// Public Interface
//*******************************************

module.exports = {
  // Reducers
  FilterReducer,
  MapReducer,
  ReduceReducer,
  WhileReducer,
  // utils
  StandardReducer,
  defaultReducerProps,
  Reduced,
  isReduced,
  // operations
  map,
  flatMap,
  filter,
  reduce,
  dedupe,
  take,
  skip,
  takeUntil,
  skipWhile,
  // functions
  transduce,
  into,
  seq
};
