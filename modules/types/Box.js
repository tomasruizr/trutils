const { curry, isFunction, I } = require( '../functions.js' );

const Box = x => ({
  chain: f => f( x ),
  ap: other => other.map( x ),
  map: f => Box( f( x )),
  fold: f => f( x ),
  inspect: () => `Box(${x})`
});

Box.fromCondition = curry(( conditionOrFunction, onTrue = I, onFalse = I, subject ) => 
  Box( conditionOrFunction )
    .map( condition => isFunction( condition ) ? condition( subject ) : condition ) 
    .map( data => data ? onTrue( subject ) : onFalse( subject )), 3 );

module.exports = Box;