function getClassProto( classProto ) {
  let proto = {};
  Object.getOwnPropertyNames( classProto ).forEach(( prop ) => {
    if ( prop !== 'constructor' ){
      proto[prop] = classProto[prop];
    }
  });
  return proto;
}

function createNew( constructors, ...args ) {
  let newObj = {};
  let protos = [];
  if ( !Array.isArray( constructors )) constructors = [constructors];
  if ( args.length && ( constructors.length > 1 && ( args.length !== 1 || typeof args[0] !== 'object' ))){
    throw new Error( 'Arguments should be an object protoname-based for each prototype' );
  }
  let params;
  for ( let index = 0; index < constructors.length; index++ ) {
    if ( typeof constructors[index] === 'function' ) {
      params = constructors.length === 1 ? args : args[0][constructors[index].name];
      params = !Array.isArray( params ) ? [params] : params;
      if ( /^class/.test( constructors[index].prototype.constructor )){
        let auxObj = new constructors[index]( ...params );
        Object.getOwnPropertyNames( auxObj ).forEach( prop => {
          newObj[prop] = auxObj[prop];
        });
        protos.push( getClassProto( constructors[index].prototype ));
      }
      else{
        constructors[index].apply( newObj, params );
        protos.push( constructors[index].prototype );
      }
    } else {
      protos.push( constructors[index]);
    }
  }
  let prototype = Object.assign({}, ...protos );
  Object.setPrototypeOf( newObj, prototype );
  return newObj;
}

function monad(obj, objectPath, nValue) {
  const parts = Array.isArray(objectPath) ? objectPath : objectPath.split('.');
  const part = parts.shift();
  if (nValue){
    if (typeof obj[part] == 'object'){
      return monad(obj[part], parts, nValue);
    } else {
      return obj[part] = nValue;
    }
  } else {
    if (typeof obj[part] == 'object'){
      return monad(obj[part], parts);
    } else {
      return obj[part];
    }  
  }
}

function validateParams(obj, objectPath) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error ('The first argument must be an object');
  if (typeof objectPath !== 'string' && !Array.isArray(objectPath)) throw new Error (`The object Path must be a string in the format 'x.y.z' or an array ['x','y','z']`);
}


function mExists(obj, objectPath) {
  validateParams(obj, objectPath);
  return !!monad(obj, objectPath);
}

function mGet(obj, objectPath) {
  validateParams(obj, objectPath);
  return monad(obj, objectPath);  
}

function mSet(obj, objectPath, nValue) {
  validateParams(obj, objectPath);
  return monad(obj, objectPath, nValue);
}

module.exports = {
  createNew,
  mExists,
  mGet,
  mSet
};