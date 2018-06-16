function createNew(constructors, args = {}) {
  let newObj = {};
  let protos = [];
  if (!Array.isArray(constructors)) constructors = [constructors];
  for (let index = 0; index < constructors.length; index++) {
    if (typeof constructors[index] === 'function') {
      constructors[index].apply(newObj, args[constructors[index].name]);
      protos.push(constructors[index].prototype);
    } else {
      protos.push(constructors[index]);
    }
  }
  let prototype = Object.assign({}, ...protos);
  Object.setPrototypeOf(newObj, prototype);
  return newObj;
}

exports.defaults = {
  createNew
};