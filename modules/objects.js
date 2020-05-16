const { isArray, isFunction, isObject } = require( './functions.js' );

const _merge = ( isArr, mergeAlgo, patch, data ) =>{
  if ( patch && typeof patch === 'object' ) {
    if ( isArray( patch )) for ( const p of patch ) _merge( isArr, mergeAlgo, p, data );
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
const mergeClone = ( patch, source ) => {
  if ( !source ) return source => mergeClone( patch, source );
  const isArr = isArray( source );
  return _merge( isArr, mergeClone, patch, isArr ? source.slice() : ({ ...source }));
}; 
const merge = ( patch, source ) => {
  if ( !source ) return source => merge( patch, source );
  const isArr = isArray( source );
  return _merge( isArr, merge, patch, source );
};

function prop( objectPath, obj ) {
  if ( !obj ) return obj => prop( objectPath, obj );
  return obj[objectPath];
}

function propPath( objectPath, obj ) {
  if ( !obj ) return obj => propPath( objectPath, obj );
  return objectPath.reduce(( currentObject, part ) => currentObject[part], obj );
}

function assoc( objectPath, nValue, obj ) {
  if ( !obj ) return obj => assoc( objectPath, nValue, obj );
  obj[objectPath] = nValue;
  return obj;
}
function assocPath( objectPath, nValue, obj ) {
  if ( !obj ) return obj => assocPath( objectPath, nValue, obj );
  const lastPath = objectPath.pop();
  const lastPart = objectPath.reduce(( currentObject, part ) => {
    currentObject[part] = currentObject[part] || {};
    return currentObject[part];
  }, obj );
  lastPart[lastPath] = nValue;
  return obj;
}

function pick( props, obj ) {
  return props.reduce(( acc, path ) =>
    isArray( path ) ? assocPath( path, propPath( path, obj ), acc ) : assoc( path, prop( path, obj ), acc )
  , {});
}

module.exports = {
  merge,
  mergeClone,
  prop,
  propPath,
  assoc,
  assocPath,
  pick
};