function monad( obj, objectPath, nValue, params = {}) {
  const {
    arrayPush = false, doNotCreate = false
  } = params;
  const parts = Array.isArray( objectPath ) ? objectPath : objectPath.split( '.' );
  const part = parts.shift();
  if ( nValue !== undefined ) {
    if ( parts.length ) {
      if ( !doNotCreate && [ undefined, null ].includes( obj[part])) obj[part] = {};
      monad( obj[part], parts, nValue, params );
    } else {
      if ( Array.isArray( obj[part])) {
        obj[part].push( nValue );
      } else if ( !obj[part] && arrayPush ) {
        obj[part] = [];
        obj[part].push( nValue );
      } else {
        obj[part] = nValue;
      }
    }
    return obj;
  } else {
    if ( typeof obj[part] === 'object' && obj[part] !== null && parts.length ) {
      return monad( obj[part], parts );
    } else {
      return obj[part];
    }
  }
}

function _validateParams( obj, objectPath ) {
  if ( !obj ) return obj;
  if ( typeof obj !== 'object' ) throw new Error( 'The first argument must be an object' );
  if ( typeof objectPath !== 'string' && !Array.isArray( objectPath )) throw new Error( `The object Path must be a string in the format 'x.y.z' or an array ['x','y','z']` );
}

function mGet( obj, objectPath ) {
  _validateParams( obj, objectPath );
  return obj ? monad( obj, objectPath ) : obj;
}

function mSet( obj, objectPath, nValue, params ) {
  _validateParams( obj, objectPath );
  return monad( obj, objectPath, nValue, params );
}

module.exports = {
  //imperative
  mGet,
  mSet,
};