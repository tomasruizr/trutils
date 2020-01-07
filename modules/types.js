const isArray = Array.isArray; 
const isFunction = ( theFunction ) => typeof theFunction === 'function'; 
const isObject = ( theObject ) => theObject instanceof Object && Object.getPrototypeOf( theObject ) === Object.getPrototypeOf({}); 
const isNumber = ( theNumber ) => typeof theNumber === 'number'; 
const isString = ( theString ) => typeof theString === 'string'; 
const ensureArray = ( theArray ) => isArray( theArray ) ? theArray : [theArray]; 

module.exports = {
  isArray,
  isFunction,
  isObject,
  isNumber,
  isString,
  ensureArray,
};