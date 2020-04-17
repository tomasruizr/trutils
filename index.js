module.exports = {
  transducers: require( './modules/transducers.js' ),
  ...require( './modules/benchmarks.js' ),
  ...require( './modules/creational.js' ),
  ...require( './modules/imperative.js' ),
  ...require( './modules/objects.js' ),
  ...require( './modules/arrays.js' ),
  ...require( './modules/functions.js' ),
  ...require( './modules/utils.js' ),
  ...require( './modules/types/Types.js' )
};