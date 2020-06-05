const isArray = Array.isArray; 
const isFunction = ( theFunction ) => typeof theFunction === 'function'; 
const isObject = ( theObject ) => theObject instanceof Object && Object.getPrototypeOf( theObject ) === Object.getPrototypeOf({}); 
const isNumber = ( theNumber ) => typeof theNumber === 'number'; 
const isString = ( theString ) => typeof theString === 'string'; 
const isError = ( error ) => error instanceof Error; 
const ensureArray = ( theArray ) => isArray( theArray ) ? theArray : ( theArray != null ? [theArray] : []); 
const True = () => true;
const False = () => false;
const I = ( x ) => x;
const noop = () => {};

const apply = ( functions, ...value ) => {
  if ( !value.length ) return ( ...curriedValue ) => apply( functions, ...curriedValue );
  return functions.map( f => f( ...value ));
};

const ap = ( functions, otherArray ) => {
  if ( !otherArray ) return ( curriedArray ) => ap( functions, curriedArray );
  return functions.flatMap( fn => otherArray.map( fn ));
};

const curry = ( fn, arity ) =>{
  return function _curry( ...args ){
    if ( arguments.length >= ( arity && arity + 1 || fn.length )) return fn( ...args );
    return ( ...argsN )=> _curry( 
      ...( arity ? Array.from( new Array( arity ), ( v, i )=> args[i]) : args ), 
      ...argsN 
    );
  };
};

const compose = ( ...functions ) =>
  functions.reduce(( accumulator, fn ) => ( ...args ) => accumulator( fn( ...args )), I );
  
const pipe = ( ...functions ) => 
  functions.reduceRight(( accumulator, fn ) => ( ...args ) => accumulator( fn( ...args )), I );

const ifElse = curry(( conditionOrFunction, onTrue = I, onFalse = I, data ) => {
  const condition = isFunction( conditionOrFunction ) ? conditionOrFunction( data ) : conditionOrFunction;
  return condition ? onTrue( data ) : onFalse( data );
}, 3 );

const map = ( fn, collection ) => {
  if ( Array.isArray( collection )) return collection.map( fn );
  const copy = { ...collection };
  Object.keys( copy ).forEach( key => copy[key] = fn( copy[key], key ));
  return copy;
};

module.exports = {
  ap,
  apply,
  compose,
  curry,
  ensureArray,
  False,
  I,
  ifElse,
  isArray,
  isError,
  isFunction,
  isNumber,
  isObject,
  isString,
  map,
  noop,
  pipe,
  True,
};