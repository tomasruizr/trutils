const range = ( start, end ) => {
  if ( end ){
    return [...Array( end - start ).keys()].map(( val, index ) => start + index );
  }
  return [...Array( start ).keys()];
};

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

const seek = ( predicate, array ) => {
  for ( const item of array ) {
    const result = predicate( item );
    if ( !result ) continue;
    return result;
  }
};

const foldMap = ( fn, empty, list ) => 
  list.reduce(( acc, x, i ) => acc.concat( fn( x, i )), empty );

module.exports = {
  seek,
  range,
  push,
  foldMap,
  unshift
};