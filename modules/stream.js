const f = require( 'flyd' );
const filter = require( 'flyd/module/filter' );
const once = require( 'flyd-once' );
const bufferCount = require( 'flyd-buffercount' );
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
  sOnce: once,
  sBufferCount: bufferCount,
  sComposeChain
};
