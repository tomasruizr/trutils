const isArray = Array.isArray; 
const isFunction = ( theFunction ) => typeof theFunction === 'function'; 
const isObject = ( theObject ) => theObject instanceof Object && Object.getPrototypeOf( theObject ) === Object.getPrototypeOf({}); 
const isNumber = ( theNumber ) => typeof theNumber === 'number'; 
const isString = ( theString ) => typeof theString === 'string'; 
const isError = ( error ) => error instanceof Error; 
const ensureArray = ( theArray ) => isArray( theArray ) ? theArray : [theArray]; 
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

module.exports = {
  ap,
  apply,
  compose,
  curry,
  ensureArray,
  False,
  I,
  isArray,
  isError,
  isFunction,
  isNumber,
  isObject,
  isString,
  noop,
  pipe,
  True,
};