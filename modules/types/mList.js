const mList = arr => {
  const ap = other => map( f => other.map( x => f( x )));
  const map = f => {
    for ( const item of arr.keys()) 
      arr[item.value] = f( item.value );
    return mList( arr );
  };
  
  const fold = f => f( arr );
  const foldMap = fold;
  
  const concat = ( other ) => {
    arr = arr.concat( other );
    return arr;
  };

  const push = value => { arr.push( value ); return arr ; };
  
  const traverse = ( point, f ) => {
    return arr.reduce(( ys, x ) =>
      ys.map( x => y => x.push( y )).ap( f( x )), point([]));
  };
  
  const inspect = () => `mList(${arr})`;

  return {
    ap,
    map,
    fold,
    foldMap,
    push,
    concat,
    traverse,
    inspect
  };
};

module.exports = mList;