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

module.exports = {
  createNew
};