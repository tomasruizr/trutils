function Task( fork ) {
  const map = ( mapFunction ) =>
    Task(( reject, resolve ) =>
      fork( reject, mapValue =>
        resolve( mapFunction( mapValue ))));

  const effect = effectFunction => 
    Task(( reject, resolve ) =>
      fork( reject, value => 
        ( effectFunction( value ), resolve( value ))));
  
  const chain = ( chainFunction ) =>
    Task(( reject, resolve ) =>
      fork( reject, chainValue => 
        Task.ensureTask( chainFunction( chainValue ))
          .fork( reject, resolve )));

  const rejectedChain = rejectedMap =>
    Task(( reject, resolve ) => 
      fork( rejectedValue => 
        Task.ensureTask( rejectedMap( rejectedValue ))
          .fork( reject, resolve )
      , resolve ));
  
  const bimap = ( rejectedMap, map = rejectedMap ) => 
    Task(( reject, resolve ) =>
      fork( rejectedValue => reject( rejectedMap( rejectedValue ))
        , value => resolve( map( value ))));

  const biEffect = ( rejectedEffectFunction, effectFunction = rejectedEffectFunction ) => 
    Task(( reject, resolve ) =>
      fork( 
        rejectedValue => 
          ( rejectedEffectFunction( rejectedValue ), reject( rejectedValue ))
        , value => 
          ( effectFunction( value ), resolve( value ))));

  const fold = ( rejectedMap, map = rejectedMap ) => 
    Task(( _, resolve ) =>
      fork( rejectedValue => resolve( rejectedMap( rejectedValue ))
        , value => resolve( map( value ))));
      
  const rejectedMap = rejectedMap =>
    Task(( reject, resolve ) => 
      fork( rejectedValue => 
        reject( rejectedMap( rejectedValue ))
      , resolve ));
 
  const rejectedEffect = rejectedEffectFunction => 
    Task(( reject, resolve ) =>
      fork( rejectedValue => 
        ( rejectedEffectFunction( rejectedValue ), reject( rejectedValue )), resolve ));

  const swap = () =>
    Task(( reject, resolve ) => 
      fork( resolve , reject ));

  const ap = ( that ) => {
    return Task( function( reject, resolve ) {
      let theFunction;
      let value;
      let isValueSet;
      let isRejected = false;
      const guardResolve = setter => item => {
        if ( isRejected ) return;
        setter( item );
        if ( theFunction != null && isValueSet ) {
          return resolve( theFunction( value ));
        } else {
          return item;
        }
      };
      const guardReject = x => {
        if ( !isRejected ) {
          isRejected = true;
          return reject( x );
        }
      };
      fork( guardReject, guardResolve( func => theFunction = func ));
      that.fork( guardReject, guardResolve( val => {
        value = val; 
        isValueSet = true;
      }));
    });
  };
  

  const or = ( that ) => {
    return Task(( reject, resolve ) => {
      let isDone = false;
      const guard = theFunction => value => {
        if ( isDone ) return;
        isDone = true;
        return theFunction( value );
      };
      fork( guard( reject ), guard( resolve ));
      that.fork( guard( reject ), guard( resolve ));
    });
  };

  
  const and = ( that ) => { 
    let resolved = false;
    let rejected = false;
    const result = [];
    const pending = ([ first, second ] = result ) =>
      first === undefined || second === undefined;
    const guard = ( rej, res, i ) => [ 
      e => resolved || rejected
        ? undefined
        : ( rejected = true , rej ( e )),
      x => ( result[i] = x || [], resolved || rejected || pending ()
        ? undefined
        : ( resolved = true , res( result.flatMap( x=>x )))),
    ];
    return Task (( reject, resolve ) => ( 
      fork( ...guard( reject, resolve, 0 )),
      that.fork( ...guard( reject, resolve, 1 ))
    ));
  };

  const toString = () => `Task(${fork})`;

      
  return { 
    isTask: true,
    map, 
    rejectedMap,
    effect,
    rejectedEffect,
    bimap,
    biEffect,
    chain,
    orElse: rejectedChain,
    rejectedChain,
    fold,
    swap,
    ap,
    concat: or,
    or,
    and,
    toString,
    fork,
  };
}

Task.of = Task.empty = taskValue => Task(( _, resolve ) => resolve( taskValue ));

Task.rejected = function _rejected( rejectedValue ) {
  return new Task( function( reject ) {
    return reject( rejectedValue );
  });
};

Task.ensureTask = ( maybeTask ) => {
  if ( maybeTask == null ) return Task.of();
  return maybeTask.isTask ? maybeTask : Task.fromPromise( maybeTask );
};

Task.fromPromise = ( maybePromise ) => new Task(( rej, res ) => 
  maybePromise.then ? maybePromise.then( res ).catch( rej ) : res( maybePromise ));

Task.isTask = ( maybeTask ) => maybeTask.isTask;

Task.and = ( task1, task2 ) => { 
  let resolved = false;
  let rejected = false;
  const result = [];
  const pending = ([ a, b ] = result ) =>
    a === undefined || b === undefined;
  const guard = ( rej, res, i ) => [ 
    e => resolved || rejected
      ? undefined
      : ( rejected = true , rej ( e )),
    x => ( result[i] = x, resolved || rejected || pending ()
      ? undefined
      : ( resolved = true , res ( result ))),
  ];
  return Task (( rej, res ) => ( 
    task1.fork ( ...guard ( rej, res, 0 )),
    task2.fork ( ...guard ( rej, res, 1 ))
  ));
};

Task.all = ( task, ...tasks ) =>
  !task ? Task.of([]) :
    Task.and( task, Task.all( ...tasks ))
      .map(([ x, xs ]) => [ x, ...xs ]);

module.exports = Task ;