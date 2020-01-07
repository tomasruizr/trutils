const { mGet, mSet } = require( './imperative.js' );
const { isArray, isFunction, isObject } = require( './types.js' );
const R = require( 'ramda' );

const rangeN = ( n ) => [...Array( n ).keys()];

const curry = fn =>{
  return function _curry( ...args ){
    if ( arguments.length >= fn.length ) return fn( ...args );
    return ( ...argsN )=> _curry( ...args, ...argsN );
  };
};

const compose = ( ...functions ) =>
  functions.reduce(( accumulator, fn ) => ( ...args ) => accumulator( fn( ...args )), x=>x );

const pipe = ( ...functions ) => 
  functions.reduceRight(( accumulator, fn ) => ( ...args ) => accumulator( fn( ...args )), x=>x );

const _merge = ( isArr, mergeAlgo, patch, data ) =>{
  if ( patch && typeof patch === 'object' ) {
    if ( isArray( patch )) for ( const p of patch ) copy = _merge( isArr, mergeAlgo, p, data );
    else {
      for ( const k of Object.keys( patch )) {
        const val = patch[k];
        if ( typeof val === 'function' ) data[k] = val( data[k], mergeAlgo );
        else if ( val === undefined ) isArr && !isNaN( k ) ? data.splice( k, 1 ) : delete data[k];
        else if ( val === null || !isObject( val ) || isArray( val )) data[k] = val;
        else if ( typeof data[k] === 'object' ) data[k] = val === data[k] ? val : mergeAlgo( val, data[k]);
        else data[k] = _merge( false, mergeAlgo, val, {});
      }
    }
  } else if ( isFunction( patch )) data = patch( data, mergeAlgo );
  return data;
}; 
const mergeCopy = ( patch, source ) => {
  if ( !source ) return source => mergeCopy( patch, source );
  const isArr = isArray( source );
  return _merge( isArr, mergeCopy, patch, isArr ? source.slice() : ({ ...source }));
}; 
const merge = ( patch, source ) => {
  if ( !source ) return source => merge( patch, source );
  const isArr = isArray( source );
  return _merge( isArr, merge, patch, source );
};

function deepGet( objectPath, obj ) {
  if ( !obj ) return obj => deepGet( objectPath, obj );
  return mGet( obj, objectPath );
}

function deepSet( objectPath, nValue, obj ) {
  if ( !obj ) return obj => deepSet( objectPath, nValue, obj );
  return mSet( obj, objectPath, nValue, {});
}

function deepFindKey( key, obj ) {
  if ( !obj ) return ( obj ) => deepFindKey( key, obj );
  const keys = Object.keys( obj );
  if ( keys.includes( key )) return obj[key];
  for ( const k of keys ) {
    if ( typeof obj[k] === 'object' ) {
      const val = deepFindKey( key, obj[k]);
      if ( val ) return val;
    }
  }
}

module.exports = {
  ...R,
  curry,
  compose,
  pipe,
  merge,
  mergeCopy,
  rangeN,
  deepFindKey,
  deepGet,
  deepSet,
};