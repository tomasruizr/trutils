function createWith( proto, properties ){
  return Object.assign( Object.create( proto ), properties );
}

function deepCreateWith( protos, initialObject = {}){
  protos = Array.isArray( protos ) ? protos : [protos];
  const protoChain = protos.reverse().reduce(( acc, current ) => {
    return Object.setPrototypeOf( current, acc );
  }, {});
  return createWith( protoChain, initialObject );
}

module.exports = {
  // object prototypes creation
  createWith,
  deepCreateWith,
};