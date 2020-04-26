const Task = require( 'data.task' );
const Box = require( './Box.js' );

Task.fromOptions = ( fns, subject ) =>
  Box.fromOptions( fns, subject ).chain( Task.ensureTask );


Task.fromPromise = ( maybePromise ) => new Task(( rej, res ) => 
  maybePromise.then ? maybePromise.then( res ).catch( rej ) : maybePromise );

Task.isTask = ( maybeTask ) => maybeTask instanceof Task;

Task.ensureTask = ( maybeTask ) => 
  Task.isTask( maybeTask ) ? maybeTask : Task.of( Task.fromPromise( maybeTask ));

module.exports = Task;