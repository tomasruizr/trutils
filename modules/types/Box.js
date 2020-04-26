const { curry, isFunction, I, False } = require( '../functions.js' );
const Either = require( './Either.js' );
const { search } = require( '../arrays.js' );

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

Box.fromOptions = curry(( conditionOrFunctions, subject ) => 
  search( fns => 
    Box( fns[0]( subject ))
      .chain( Either.fromFalseable )
      .fold( False, () => Box( fns[1]( subject ))
        .fold( Box )
      )
  , conditionOrFunctions ));

module.exports = Box;