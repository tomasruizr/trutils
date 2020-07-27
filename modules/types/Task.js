const Task = require( 'data.task' );


Task.fromPromise = ( maybePromise ) => new Task(( rej, res ) => 
  maybePromise.then ? maybePromise.then( res ).catch( rej ) : res( maybePromise ));

Task.isTask = ( maybeTask ) => maybeTask instanceof Task;

module.exports = Task;