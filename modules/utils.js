const { ensureArray } = require( './types.js' );
function createQueue( init ){
  let values = ( init && ensureArray( init )) || [];
  return {
    pop() { return !!values.length && values.pop( values ); },
    push( value ) { values.unshift( value ); return this; },
    get length() { return values.length ; }
  };
}

function formatLogDateTime( date ) {
  const timeMethods = [
    'getHours',
    'getMinutes',
    'getSeconds',
  ];
  if ( typeof date === 'string' ) date = +date;
  date = new Date( date );
  const str = `${date.toLocaleDateString()} ${timeMethods.map( m=>date[m]().toString().padStart( 2, '0' )).join( ':' )}.${date.getMilliseconds().toString().padStart( 3,'0' )}`;
  return str;
}

module.exports = {
  createQueue,
  formatLogDateTime
};