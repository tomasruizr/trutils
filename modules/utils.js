const { isError, curry, I } = require( './functions.js' );
const Task = require( './types/Task.js' );
const Either = require( './types/Either.js' );
Either;
const jsonParse = Either.tryCatch( JSON.parse );

const runMiddleWares = ( middlewares, ...subject ) => middlewares.reduce(( subjectTask, mw ) =>
  subjectTask
    .chain( currentSubject => new Task(( rej, res ) =>
      mw( ...currentSubject, ( err ) => err ? rej( err ) : res( currentSubject ))))
, Task.of( subject ));

const cor = curry(( fns, params ) => 
  fns.reduce(( accTask, fn ) =>
    accTask.chain( x => 
      Task.ensureTask( Either.tryCatch( fn )( x ).fold( Task.rejected, I )))
  , Task.ensureTask( params ))
    .orElse( rejected => isError( rejected ) ? Task.rejected( rejected ) : Task.of( rejected )));

const eitherToTask = e => e.fold( Task.rejected, Task.ensureTask );

module.exports = {
  jsonParse,
  eitherToTask,
  runMiddleWares,
  cor
};