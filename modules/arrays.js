const { fromFalseable } = require( './types/Either.js' );

const range = ( start, end ) => 
  fromFalseable( end )
    .map(() => [...Array( end - start ).keys()].map(( val, index ) => start + index ))
    .fold(() => [...Array( start ).keys()], ( array ) => array );

function push( value, list ) {
  if ( !list ) return l => push( value, l );
  list.push( value );
  return list;
}
    
function unshift( value, list ) {
  if ( !list ) return l => unshift( value, l );
  list.unshift( value );
  return list;
}

const search = ( predicate, array ) => {
  for ( const item of array ) {
    const result = predicate( item );
    if ( !result ) continue;
    return result;
  }
};

module.exports = {
  search,
  range,
  push,
  unshift
};