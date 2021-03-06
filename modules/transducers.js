const t = require( 'transducers.js' );

function reduce( transform, init, collection ) {
  if ( !collection ) return coll => reduce( transform, init, coll );
  let accumulation = init;
  return {
    '@@transducer/step': ( accumulated, current ) => {
      accumulation = transform( accumulation, current );
      return collection['@@transducer/step']( accumulated, current );
    },
    '@@transducer/result': () => accumulation,
  };
}

const seq = ( transform, collection ) => {
  if ( !collection ) return coll => seq( transform, coll );
  return t.seq( collection, transform );
};

const into = ( to, transform, collection ) => {
  if ( !collection ) return coll => into( to, transform, coll );
  return t.into( to, transform, collection );
};

module.exports = {
  //transducers
  reduce,//: t.reduce,
  map: t.map,
  filter: t.filter,
  remove: t.remove,
  keep: t.keep,
  take: t.take,
  takeWhile: t.takeWhile,
  drop: t.drop,
  dropWhile: t.dropWhile,
  dedupe: t.dedupe,
  transduce: t.transduce,
  seq,
  into,
};