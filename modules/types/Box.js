const { curry, isFunction, I } = require( '../functions.js' );

const Box = value => ({
  value,
  chain: f => f( value ),
  ap: other => other.map( value ),
  map: f => Box( f( value )),
  effect: ( f ) => ( f( value ), Box( value )), 
  concat: ({ value: otherValue }) =>
    Box( value.concat( otherValue )),
  fold: f => f( value ),
  inspect: () => `Box(${value})`
});

Box.fromCondition = curry(( conditionOrFunction, onFalse = I, onTrue = I, subject ) => 
  Box( conditionOrFunction )
    .map( condition => isFunction( condition ) ? condition( subject ) : condition ) 
    .map( data => data ? onTrue( subject ) : onFalse( subject )), 3 );

module.exports = Box;