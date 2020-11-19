const { curry } = require( '../functions.js' );
const flyd = require( '@tomasruizr/flyd' );
const filter = require( '@tomasruizr/flyd/module/filter' );
const { dropRepeats } = require( '@tomasruizr/flyd/module/droprepeats' );

const once = function ( stream$ ) {
  return flyd.combine( function ( s$, self ) {
    self( s$());
    self.end( true );
  }, [stream$]);
};

const bufferCount = function( bufferSize, bufferEvery, source ) {
  if ( flyd.isStream( bufferEvery )) {
    source = bufferEvery;
    bufferEvery = bufferSize;
  }
  let buffer = [];
  return flyd.combine( function( source, self ) {
    buffer.push( source());
    if ( buffer.length === bufferSize ) {
      self( buffer );
      buffer = bufferEvery ? buffer.slice( bufferEvery ) : buffer = [];
    }
  }, [source]);
};

const skip = module.exports = curry( function ( count, s ) {
  return flyd.combine( function( s, self ) {
    if ( count <= 0 ) {
      self( s());
    } else {
      count--;
    }
  }, [s]);
});

function getReadOnly ( originalStream ){
  return flyd.combine( x=>x(), [originalStream]);
}

module.exports = {
  ...flyd,
  filter,
  dedupe: dropRepeats,
  once,
  skip,
  bufferCount,
  getReadOnly,
};
