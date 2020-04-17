const { isError, curry } = require( './functions.js' );
const Task = require( './types/Task.js' );
const Either = require( './types/Either.js' );

const jsonParse = Either.tryCatch( JSON.parse );

const runMiddleWares = ( middlewares, ...subject ) => middlewares.reduce(( subjectTask, mw ) =>
  subjectTask
    .chain( currentSubject => new Task(( rej, res ) =>
      mw( ...currentSubject, ( err ) => err ? rej( err ) : res( currentSubject ))))
, Task.of( subject ));

const cor = curry(( fns, params ) => 
  fns.reduce(( task, fn ) => task.chain( fn ), Task.of( params ))
    .orElse( res => isError( res ) ? Task.rejected( res ) : Task.of( res )));


// Either.of( 'algo' )
//   .chain( str => Either.Right( `${str}$` ))
//   .chain( str => Task.of( Either.Right( `${str}@` )))
//   .chain( str => Either.Right( `${str}@` ))
//   .chain( str => new Task(( rej, res ) => res( `${str}@` )))
//   .chain( str => Either.Right( `${str}#` ))
//   .chain( str => new Promise( res => res( `${str}@` )))
//   .chain( str => /algo/.test( str ) ? Either.Left( str ) : Either.Right( str ))
//   .chain( str => /nada/.test( str ) ? Either.Left( new Error( 'nada es permitido' )) : Either.Right( str ))
//   .chain( str => Either.Right( `${str}$` ))
//   .chain( str => Either.Right( `${str}%` ))
//   .fold( res => isError( res ) ? Either.Left( res ) : Either.Right( res ), Either.Right )
//   .fold( console.error, str => console.log( `El resultado es ${str}` ));


module.exports = {
  jsonParse,
  runMiddleWares,
  cor
};