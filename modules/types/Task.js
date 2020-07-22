// const { seek } = require( '../arrays.js' );
// const { curry, False } = require( '../functions.js' );
const Task = require( 'data.task' );


Task.fromPromise = ( maybePromise ) => new Task(( rej, res ) => 
  maybePromise.then ? maybePromise.then( res ).catch( rej ) : res( maybePromise ));

Task.isTask = ( maybeTask ) => maybeTask instanceof Task;

Task.ensureTask = ( maybeTask ) => {
  if ( !maybeTask ) return Task.of();
  return Task.isTask( maybeTask ) ? maybeTask : Task.fromPromise( maybeTask );
};

module.exports = Task;