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

const findAndPerform = ( predicate, array ) => {
  for ( const item of array ) {
    const result = predicate( item );
    if ( !result ) continue;
    return result;
  }
};

const foldMap = ( fn, point, functorArray ) => 
  functorArray.reduce(( acc, functor ) => acc.concat( functor.map ? functor.map( fn ) : fn( functor )), point );

module.exports = {
  findAndPerform,
  range,
  push,
  foldMap,
  unshift
};