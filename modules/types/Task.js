// const { seek } = require( '../arrays.js' );
// const { curry, False } = require( '../functions.js' );
const Task = require( 'data.task' );
// const Box = require( './Box.js' );
// const Either = require( './Either.js' );

// Task.fromOptions = curry(( conditionsOrFunctions, subject ) => 
//   seek( fns => 
//     Task.ensureTask( fns[0]( subject ))
//       .( False, () => Box( fns[1]( subject ))
//         .fold( Box )
//       )
//   , conditionsOrFunctions ));


Task.fromPromise = ( maybePromise ) => new Task(( rej, res ) => 
  maybePromise.then ? maybePromise.then( res ).catch( rej ) : res( maybePromise ));

Task.isTask = ( maybeTask ) => maybeTask instanceof Task;

Task.ensureTask = ( maybeTask ) => {
  maybeTask;//?
  return Task.isTask( maybeTask ) ? maybeTask : Task.fromPromise( maybeTask );
};

module.exports = Task;