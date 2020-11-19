const { should } = require( 'chai' );
const { isArray, isFunction, isObject, curry } = require( './functions.js' );
const Either = require( './types/Either.js' );

const clone = obj => {
  const out = Array.isArray( obj ) ? Array( obj.length ) : {};
  if ( obj && obj.getTime ) return new Date( obj.getTime());

  for ( const key in obj ){
    const value = obj[ key ];
    out[ key ] =
      typeof value === 'object' && value !== null ?
        value.getTime ?
          new Date( value.getTime()) :
          clone( value ) :
        value;
  }
  return out;
};

const _merge = ( isArr, mergeAlgo, patch, data, shouldDelete = true ) =>{
  if ( patch && typeof patch === 'object' ) {
    if ( isArray( patch )) for ( const p of patch ) _merge( isArr, mergeAlgo, p, data );
    else {
      for ( const k of Object.keys( patch )) {
        const val = patch[k];
        if ( typeof val === 'function' ) data[k] = val( data[k], mergeAlgo );
        else if ( val === undefined ) 
          if ( !shouldDelete ) continue;
          else isArr && !isNaN( k ) ? data.splice( k, 1 ) : delete data[k];
        else if ( val === null || !isObject( val ) || isArray( val )) data[k] = val;
        else if ( typeof data[k] === 'object' ) data[k] = val === data[k] ? val : mergeAlgo( data[k], val, shouldDelete );
        else data[k] = _merge( false, mergeAlgo, val, {}, shouldDelete );
      }
    }
  } else if ( isFunction( patch )) data = patch( data, mergeAlgo );
  return data;
}; 

const mergeClone = ( source, patch, shouldDelete ) => {
  const isArr = isArray( source );
  return _merge( isArr, mergeClone, patch, isArr ? source.slice() : ({ ...source }), shouldDelete );
}; 

const merge = ( source, patch, shouldDelete ) => {
  const isArr = isArray( source );
  return _merge( isArr, merge, patch, source, shouldDelete );
};

function prop( objectPath, obj ) {
  if ( !obj ) return obj => prop( objectPath, obj );
  return obj[objectPath];
}

function propPath( objectPath, obj ) {
  if ( !obj ) return obj => propPath( objectPath, obj );
  return objectPath.reduce(( currentObject, part ) => currentObject && currentObject[part], obj );
}

const assoc = curry(( objectPath, nValue, obj ) => {
  obj[objectPath] = nValue;
  return obj;
});

const dissoc = curry(( objectPath, obj ) => {
  delete obj[objectPath];
  return obj;
});

function assocPath( objectPath, nValue, obj ) {
  if ( !obj ) return obj => assocPath( objectPath, nValue, obj );
  const path = objectPath.slice( 0 );
  const lastPath = path.pop();
  lastPath;
  const lastPart = path.reduce(( currentObject, part ) => {
    currentObject[part] = currentObject[part] || {};
    return currentObject[part];
  }, obj );
  lastPart[lastPath] = nValue;
  return obj;
}

function dissocPath( objectPath, obj ) {
  if ( !obj ) return obj => dissocPath( objectPath, obj );
  const path = objectPath.slice( 0 );
  const lastPath = path.pop();
  lastPath;
  const lastPart = path.reduce(( currentObject, part ) => {
    currentObject[part] = currentObject[part] || {};
    return currentObject[part];
  }, obj );
  delete lastPart[lastPath];
  return obj;
}

function fromPairs( pairs ){
  const result = {};
  pairs.forEach(([ prop, value ]) => result[ prop ] = value );
  return result;
}
function toPairs( object ){
  const result = [];
  Object.keys( object ).forEach( key => result.push([ key, object[key] ]));
  return result;
}

const has = ( prop, obj ) => !obj ? ( obj ) => has( prop, obj ) : Object.prototype.hasOwnProperty.call( obj, prop ); 

const hasPath = ( path, obj ) => !obj ? 
  ( obj ) => hasPath( path, obj ) : 
  Object.prototype.hasOwnProperty.call( propPath( propPath( path.slice( 0, path.length - 1 ), obj ), prop )); 

const pick = ( props, obj ) => !obj ? ( obj ) => pick( props, obj ) :
  props.reduce(( acc, path ) =>
    isArray( path ) ? 
      Either.fromNullable( propPath( path, obj ))
        .fold(() => acc, ( val ) => assocPath( path, val, acc )) :
      Either.fromNullable( prop( path, obj ))
        .fold(() => acc, ( val ) => assoc( path, val, acc ))
  , Array.isArray( obj ) ? [] : {});

const omit = ( props, obj ) => !obj ? ( obj ) => omit( props, obj ) :  
  Object.keys( obj ).reduce(( acc, property ) =>
    props.includes( property ) ? acc : assoc( property, prop( property, obj ), acc )
  , Array.isArray( obj ) ? [] : {});

const appendDeep = curry(( path, value, list ) => {
  const lastPath = path.slice( -1 )[0];
  const lastPart = path.reduce(( currentObject, part ) => {
    currentObject[part] = currentObject[part] || ( part === lastPath ? [] : {});
    return currentObject[part];
  }, list );
  lastPart.push( value );
  return list;
});

module.exports = {
  clone,
  merge,
  mergeClone,
  prop,
  propPath,
  appendDeep,
  assoc,
  dissoc,
  assocPath,
  dissocPath,
  pick,
  has,
  hasPath,
  omit,
  fromPairs,
  toPairs
};