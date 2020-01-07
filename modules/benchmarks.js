function measureTime( f, times = 1 ) {
  let s = new Date();
  for ( let index = 0; index < times; index++ ) {
    f();
  }
  return new Date().valueOf() - s.valueOf();
}
  
function compareTimes( title, fns, times ) {
  fns = typeof fns === 'object' ? fns : [fns];
  const keys = Object.keys( fns );
  const result = {};
  for ( let index = 0; index < keys.length; index++ ) {
    let fnName = keys[index];
    result[fnName] = `${measureTime( fns[fnName], times )}ms`;
  }
  return { [title]:result };
}

module.exports = {
  // benchmarks
  compareTimes,
  measureTime
};