const { curry, I, isFunction, False } = require( '../functions.js' );
const { seek } = require( '../arrays.js' );

const Right = x =>
  ({
    isRight: true,
    chain: f => f( x ),
    ap: other => other.map( x ),
    traverse: ( of, f ) => f( x ).map( Right ),
    map: f => Right( f( x )),
    fold: ( f, g ) => g( x ),
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

const fromValidation = curry(( conditionOrFunction, onTrue = I, onFalse = I, subject ) => {
  const data = isFunction( conditionOrFunction ) ? conditionOrFunction( subject ) : conditionOrFunction;
  return data ? Right( onTrue( subject )) : Left( onFalse( subject ));
}, 3 );

const fromOptions = curry(( conditionsOrFunctions, subject ) =>
  seek( fns => 
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

module.exports = { 
  Right,
  Left,
  fromNullable,
  fromFalseable,
  fromOptions,
  fromValidation,
  tryCatch,
  isEither,
  of: Right 
};