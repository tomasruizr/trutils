// Semigroups
const { ensureArray } = require( '../functions.js' );

const Queue = ( init ) => {
  let values = ( init && ensureArray( init )) || [];
  return {
    get length() { return values.length ; },
    pop() { return !!values.length && values.pop( values ); },
    push( value ) { values.unshift( value ); return this; },
    ap: data => values.map( x => x( data )),
    map: f => Queue( values.map( f )),
    fold: f => values.map( f ),
    concat: other=> Queue( other.concat( values )),
    inspect: () => `Queue(${values})`
  };
};

const First = x =>
  ({
    x,
    concat: () =>
      First( x ),
    inspect: () =>
      `First(${x})`,
    toString: () =>
      `First(${x})`
  });

const Sum = x =>
  ({
    x,
    concat: ({ x: y }) =>
      Sum( x + y ),
    inspect: () =>
      `Sum(${x})`,
    toString: () =>
      `Sum(${x})`
  });

//const res = Sum(1).concat(Sum(2))

const All = x =>
  ({
    x,
    concat: ({ x: y }) =>
      All( x && y ),
    inspect: () =>
      `All(${x})`,
    toString: () =>
      `All(${x})`
  });

const Product = x =>
  ({
    x,
    concat: ({ x: y }) => Product( x * y ),
    inspect: () => `Product(${x})`
  });


const Any = x =>
  ({
    x,
    concat: ({ x: y }) => Any( x || y ),
    inspect: () => `Any(${x})`
  });

const Max = x =>
  ({
    x,
    concat: ({ x: y }) => Max( x > y ? x : y ),
    inspect: () => `Max(${x})`
  });


const Min = x =>
  ({
    x,
    concat: ({ x: y }) => Min( x < y ? x : y ),
    inspect: () => `Min(${x})`
  });

const Pair = ( x, y ) =>
  ({
    x,
    y,
    bimap: ( f, g ) => Pair( f( x ), g( y )),
    toList: () => [ x, y ],
    concat: ({ x: x1, y: y1 }) =>
      Pair( x.concat( x1 ), y.concat( y1 )),
    fold: ( f ) => f( x, y ),
    inspect: () => `Pair(${x}, ${y})`
  });

//TODO: Agregar Fn: https://egghead.io/lessons/javascript-a-curated-collection-of-monoids-and-their-uses : 1:00 

// Monoids
Sum.empty = () => Sum( 0 );
All.empty = () => Sum( true );
Product.empty = () => Product( 1 );
Any.empty = () => Any( false );
Max.empty = () => Max( -Infinity );
Min.empty = () => Min( Infinity );

module.exports = {
  Box: require( './Box.js' ),
  Either: require( './Either.js' ),
  Stream: require( './Stream.js' ),
  Task: require( './Task.js' ),
  Queue,
  First,
  Sum,
  All,
  Pair,
  Product, 
  Any,
  Max,
  Min
};