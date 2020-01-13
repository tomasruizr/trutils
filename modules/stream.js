const f = require( '@tomasruizr/flyd' );
const filter = require( '@tomasruizr/flyd/module/filter' );
const { dropRepeats } = require( '@tomasruizr/flyd/module/droprepeats' );
const once = require( 'flyd-once' );
const bufferCount = require( 'flyd-buffercount' );
const skip = require( 'flyd-skip' );
const { ifElse, prop, tryCatch } = require( './fp.js' );

function sComposeChain( fnsArray, params = {}) {
  const result = f.stream();
  const accumulatedStream = f.stream( params );
  f.endsOn( result, accumulatedStream );
  const resolveValue = ifElse( prop( 'then' ), 
    ( promise )=>promise.then( accumulatedStream ).catch( result ),
    accumulatedStream
  );
  accumulatedStream.map(
    tryCatch( ifElse(() => !!fnsArray.length, 
      accumulate=>resolveValue( fnsArray.shift()( accumulate )),
      result
    ),result ));
  return result;  
}

function sGetReadOnly ( originalStream ){
  const newStream = f.stream();
  const originalPush = newStream.push;
  f.on( originalPush, originalStream );
  newStream.push = function(){ return arguments.length === 0 ? originalStream.val : undefined ; };
  return newStream;
}

module.exports = {
  stream: f.stream,
  sMap: f.map,
  sOn: f.on,
  sReduce: f.scan,
  sMerge: f.merge,
  sTransduce: f.transduce,
  sCombine: f.combine,
  sImmediate: f.immediate,
  sFromPromise: f.fromPromise,
  sFlattenPromise: f.flattenPromise,
  sChain: f.chain,
  sApply: f.ap,
  sFilter: filter,
  sDedupe: dropRepeats,
  sOnce: once,
  sSkip: skip,
  sBufferCount: bufferCount,
  sComposeChain,
  sGetReadOnly
};
