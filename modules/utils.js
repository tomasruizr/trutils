const { isError, curry, I } = require( './functions.js' );
const Task = require( './types/Task.js' );
const Either = require( './types/Either.js' );
const jsonParse = Either.tryCatch( JSON.parse );

const runMiddleWares = ( middlewares, ...subject ) => middlewares.reduce(( subjectTask, mw ) =>
  subjectTask
    .chain( currentSubject => new Task(( rej, res ) =>
      mw( ...currentSubject, ( err ) => err ? rej( err ) : res( currentSubject ))))
, Task.of( subject ));

const cor = curry(( fns, params ) => 
  fns.reduce(( accTask, fn ) =>
    accTask.chain( x => 
      ensureTask( Either.tryCatch( fn )( x ).fold( Task.rejected, I )))
  , ensureTask( params ))
    .orElse( rejected => isError( rejected ) ? Task.rejected( rejected ) : Task.of( rejected )));

const eitherToTask = e => e.fold( Task.rejected, ensureTask );

const fromNullableToTask = value => Either.fromNullable( value ).fold( Task.rejected, ensureTask );

const fromFalseableToTask = condition => value => Either.fromFalseable( condition( value )).fold(() => Task.rejected( value ), () => ensureTask( value ));

const ensureTask = ( maybeTask ) => {
  if ( !maybeTask ) return Task.of();
  return Task.isTask( maybeTask ) ? maybeTask : Task.fromPromise( maybeTask );
};

module.exports = {
  jsonParse,
  eitherToTask,
  runMiddleWares,
  fromNullableToTask,
  fromFalseableToTask,
  ensureTask,
  cor
};