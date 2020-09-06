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

const fromNullableToTask = value => new Task(( reject, resolve ) => Either.fromNullable( value ).fold( reject, resolve ));

const fromFalseableToTask = value => new Task(( reject, resolve ) => Either.fromFalseable( value ).fold( reject, resolve )); 

const fromValidationToTask = condition => value => new Task(( reject, resolve ) => Either.fromValidation( condition )( value ).fold( reject, resolve )); 

const fromAllValidationsToTask = curry(( conditionsOrFunctions, subject ) => new Task(( reject, resolve ) =>
  Either.fromAllValidations( conditionsOrFunctions, subject ).fold( reject, resolve )
));

const fromValidationsToTask = curry(( conditionsOrFunctions, subject ) => new Task(( reject, resolve ) =>
  Either.fromValidations( conditionsOrFunctions, subject ).fold( reject, resolve )
));

const fromOptionsToTask = curry(( conditionsOrFunctions, subject ) => new Task(( reject, resolve ) =>
  Either.fromOptions( conditionsOrFunctions, subject ).fold( reject, resolve )
));

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
  fromValidationToTask,
  fromValidationsToTask,
  fromAllValidationsToTask,
  fromOptionsToTask,
  ensureTask,
  cor
};