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
    concat: other=> Queue( values.concat( other )),
    inspect: () => `Queue(${values})`
  };
};

module.exports = {
  Queue,
};