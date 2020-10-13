const { curry, I, isFunction, False, True } = require( '../functions.js' );
const { findAndPerform } = require( '../arrays.js' );

const Right = x =>
  ({
    isRight: true,
    chain: f => f( x ),
    ap: other => other.map( x ),
    traverse: ( of, f ) => f( x ).map( Right ),
    map: f => Right( f( x )),
    bimap: ( f, g = f ) => Right( g( x )),
    effect: ( f ) => ( f( x ), Right( x )), 
    leftMap: () => Right( x ),
    fold: ( f, g = f ) => g( x ),
    concat: o =>
      o.fold(() => Right( x ),
        y => Right( x.concat( y ))),
    inspect: () => `Right(${x})`
  });

const Left = x =>
  ({
    isLeft: true,
    chain: () => Left( x ),
    ap: () => Left( x ),
    traverse: ( of ) => of( Left( x )),
    map: () => Left( x ),
    effect: ( f ) => ( f( x ), Left( x )), 
    bimap: f => Left( f( x )),
    leftMap: ( f ) => Left( f( x )),
    fold: ( f ) => f( x ),
    concat: o =>
      o.fold(() => Left( x ),
        () => o ),
    inspect: () => `Left(${x})`
  });

const fromNullable = x =>
  x != null ? Right( x ) : Left( null );

const fromFalseable = ( data ) => 
  [ undefined, null, false, '', 0 ].includes( data ) ? Left( data ) : Right( data ); 

const fromValidation = curry(( conditionOrFunction, onFalse = I, onTrue = I, subject ) => {
  const data = isFunction( conditionOrFunction ) ? conditionOrFunction( subject ) : conditionOrFunction;
  return data ? Right( onTrue( subject )) : Left( onFalse( subject ));
}, 3 );

const fromAllValidations = curry(( conditionsOrFunctions, subject ) => {
  const errors = conditionsOrFunctions.reduce(( acc, conditionOrFunction ) => {
    const data = isFunction( conditionOrFunction[0]) ? conditionOrFunction[0]( subject ) : conditionOrFunction[0];
    !data && acc.push( conditionOrFunction[1]);
    return acc;
  },[]);
  return errors.length ? Left( errors ) : Right( subject );
});

const fromValidations = curry(( conditionsOrFunctions, subject ) =>
  findAndPerform( fns => 
    fromFalseable( fns[0]( subject ))
      .fold( False, () => Left( fns[1]( subject )))
  , conditionsOrFunctions ) || Right( subject ));

const fromOptions = curry(( conditionsOrFunctions, subject ) =>
  findAndPerform( fns => 
    fromFalseable( fns[0]( subject ))
      .fold( False, () => Right( fns[1]( subject )))
  , conditionsOrFunctions ) || Left( null ));

const tryCatch = f => ( ...args ) => {
  try {
    return Right( f( ...args ));
  } catch( e ) {
    return Left( e );
  }
};

const isEither = x => ( x && ( x.isLeft || x.isRight )) === true; 

const any = ( conditionsOrFunctions, subject ) => !subject ? subject => any( conditionsOrFunctions, subject ) :
  conditionsOrFunctions
    .reduce(( acc, current )=> acc || ( isFunction( current ) ? !!current( subject ) : !!current ), false );

const all = ( conditionsOrFunctions, subject ) => !subject ? subject => all( conditionsOrFunctions, subject ) :
  fromFalseable( findAndPerform( current => ( isFunction( current ) ? !current( subject ) : !current ), conditionsOrFunctions ))
    .fold( True, False );


module.exports = { 
  Right,
  Left,
  fromNullable,
  fromFalseable,
  fromOptions,
  fromValidation,
  fromValidations,
  fromAllValidations,
  tryCatch,
  isEither,
  of: Right,
  all,
  any
};