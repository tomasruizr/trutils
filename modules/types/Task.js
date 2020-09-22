function Task( fork ) {
  this.fork = fork;
}

Task.prototype.isTask = true;

Task.prototype.map = function ( mapFunction ) {
  return new Task(( reject, resolve ) =>
    this.fork( reject, mapValue =>
      resolve( mapFunction( mapValue ))));
};

Task.prototype.rejectedMap = function( rejectedMap ){
  return new Task(( reject, resolve ) => 
    this.fork( rejectedValue => 
      reject( rejectedMap( rejectedValue ))
    , resolve ));
};

Task.prototype.bimap = function ( rejectedMap, map = rejectedMap ){ 
  return new Task(( reject, resolve ) =>
    this.fork( rejectedValue => reject( rejectedMap( rejectedValue ))
      , value => resolve( map( value ))));
};

Task.prototype.chain = function ( chainFunction ) {
  return new Task(( reject, resolve ) =>
    this.fork( reject, chainValue => 
      Task.ensureTask( chainFunction( chainValue ))
        .fork( reject, resolve )));
};

Task.prototype.rejectedChain = Task.prototype.orElse = function ( rejectedMap ){
  return new Task(( reject, resolve ) => 
    this.fork( rejectedValue => 
      Task.ensureTask( rejectedMap( rejectedValue ))
        .fork( reject, resolve )
    , resolve ));
};

Task.prototype.bichain = function ( rejectedMap, map = rejectedMap ){ 
  return new Task(( reject, resolve ) =>
    this.fork( rejectedValue => 
      Task.ensureTask( rejectedMap( rejectedValue ))
        .fork( reject, resolve )
    , value => 
      Task.ensureTask( map( value ))
        .fork( reject, resolve )));
};

Task.prototype.effect = function ( effectFunction ) {
  return new Task(( reject, resolve ) =>
    this.fork( reject, value => 
      ( effectFunction( value ), resolve( value ))));
};

Task.prototype.rejectedEffect = function( rejectedEffectFunction ){ 
  return new Task(( reject, resolve ) =>
    this.fork( rejectedValue => 
      ( rejectedEffectFunction( rejectedValue ), reject( rejectedValue )), resolve ));
};

Task.prototype.bieffect = function( rejectedEffectFunction, effectFunction = rejectedEffectFunction ){
  return new Task(( reject, resolve ) =>
    this.fork( 
      rejectedValue => 
        ( rejectedEffectFunction( rejectedValue ), reject( rejectedValue ))
      , value => 
        ( effectFunction( value ), resolve( value ))));
};

Task.prototype.fold = function( rejectedMap, map = rejectedMap ){ 
  return new Task(( _, resolve ) =>
    this.fork( rejectedValue => resolve( rejectedMap( rejectedValue ))
      , value => resolve( map( value ))));
};

Task.prototype.swap = function(){
  return new Task(( reject, resolve ) => 
    this.fork( resolve , reject ));
};

Task.prototype.ap = function( that ){ 
  return new Task(( reject, resolve ) => {
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
    this.fork( guardReject, guardResolve( func => theFunction = func ));
    that.fork( guardReject, guardResolve( val => {
      value = val; 
      isValueSet = true;
    }));
  });
};

Task.prototype.or = function( that ){
  return new Task(( reject, resolve ) => {
    let isDone = false;
    const guard = theFunction => value => {
      if ( isDone ) return;
      isDone = true;
      return theFunction( value );
    };
    this.fork( guard( reject ), guard( resolve ));
    that.fork( guard( reject ), guard( resolve ));
  });
};

Task.prototype.and = Task.prototype.concat = function( that ) { 
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
  return new Task(( reject, resolve ) => ( 
    this.fork( ...guard( reject, resolve, 0 )),
    that.fork( ...guard( reject, resolve, 1 ))
  ));
};

Task.prototype.toString = () => `Task(${this.fork})`;

Task.of = Task.empty = taskValue => new Task(( _, resolve ) => resolve( taskValue ));

Task.rejected = rejectedValue => new Task( reject => reject( rejectedValue ));

Task.ensureTask = maybeTask => {
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
  return new Task (( rej, res ) => ( 
    task1.fork ( ...guard ( rej, res, 0 )),
    task2.fork ( ...guard ( rej, res, 1 ))
  ));
};

Task.all = ( task, ...tasks ) =>
  !task ? Task.of([]) :
    Task.and( task, Task.all( ...tasks ))
      .map(([ x, xs ]) => [ x, ...xs ]);

module.exports = Task ;