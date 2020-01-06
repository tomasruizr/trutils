const t = require('transducers.js');

const curry = fn =>{
  return function _curry(...args){
    if (arguments.length >= fn.length) return fn(...args);
    return (...argsN)=> _curry(...args, ...argsN);
  }
}

const compose = (...functions) =>
  functions.reduce((accumulator, fn) => (...args) => accumulator(fn(...args)), x=>x)

const pipe = (...functions) => 
  functions.reduceRight((accumulator, fn) => (...args) => accumulator(fn(...args)), x=>x);

function monad(obj, objectPath, nValue, params = {}) {
	const {arrayPush = false, doNotCreate = false} = params;
	const parts = Array.isArray(objectPath) ? objectPath : objectPath.split('.');
	const part = parts.shift();
	if (nValue !== undefined) {
		if (parts.length) {
			if (!doNotCreate && [undefined, null].includes(obj[part])) obj[part] = {};
			monad(obj[part], parts, nValue, params)
		} else {
			if (Array.isArray(obj[part])) {
				obj[part].push(nValue);
			} else if (!obj[part] && arrayPush) {
				obj[part] = [];
				obj[part].push(nValue);
			} else {
				obj[part] = nValue;
			}
		}
		return obj;
	} else {
		if (typeof obj[part] === 'object' && obj[part] !== null && parts.length) {
			return monad(obj[part], parts);
		} else {
			return obj[part];
		}
	}
}

function _validateParams(obj, objectPath) {
	if (!obj) return obj;
	if (typeof obj !== 'object') throw new Error('The first argument must be an object');
	if (typeof objectPath !== 'string' && !Array.isArray(objectPath)) throw new Error(`The object Path must be a string in the format 'x.y.z' or an array ['x','y','z']`);
}

function mGet(obj, objectPath) {
	_validateParams(obj, objectPath);
	return obj ? monad(obj, objectPath) : obj;
}

function mSet(obj, objectPath, nValue, params) {
	_validateParams(obj, objectPath);
	return monad(obj, objectPath, nValue, params);
}

function deepGet(objectPath, obj) {
	if (!obj) return obj => deepGet(objectPath, obj);
	return mGet(obj, objectPath);
}

function deepSet(objectPath, nValue, obj) {
	if (!obj) return obj => deepSet(objectPath, nValue, obj);
	return mSet(obj, objectPath, nValue, {});
}

function deepFindKey(key, obj) {
	if (!obj) return (obj) => deepFindKey(key, obj);
	const keys = Object.keys(obj);
	if (keys.includes(key)) return obj[key];
	for (const k of keys) {
		if (typeof obj[k] === 'object') {
			const val = deepFindKey(key, obj[k]);
			if (val) return val;
		}
	}
}

const _merge = (isArr, mergeAlgo, patch, data) =>{
  if (patch && typeof patch === 'object') {
    if (isArray(patch)) for (const p of patch) copy = _merge(isArr, mergeAlgo, p, data)
    else {
      for (const k of Object.keys(patch)) {
        const val = patch[k]
        if (typeof val === 'function') data[k] = val(data[k], mergeAlgo)
        else if (val === undefined) isArr && !isNaN(k) ? data.splice(k, 1) : delete data[k]
        else if (val === null || !isObject(val) || isArray(val)) data[k] = val
        else if (typeof data[k] === 'object') data[k] = val === data[k] ? val : mergeAlgo(val, data[k])
        else data[k] = _merge(false, mergeAlgo, val, {})
      }
    }
  } else if (isFunction(patch)) data = patch(data, mergeAlgo)
  return data
} 
const mergeCopy = (patch, source) => {
  if (!source) return source => mergeCopy(patch, source);
  const isArr = isArray(source);
  return _merge(isArr, mergeCopy, patch, isArr ? source.slice() : Object.assign({}, source))
} 
const merge = (patch, source) => {
  if (!source) return source => merge(patch, source);
  const isArr = isArray(source);
  return _merge(isArr, merge, patch,  source)
}

function createWith(proto, properties){
	return Object.assign(Object.create(proto), properties);
}

function deepCreateWith(protos, initialObject = {}){
	protos = Array.isArray(protos) ? protos : [protos];
	const protoChain = protos.reverse().reduce((acc, current) => {
		return Object.setPrototypeOf(current, acc);
	}, {})
	return createWith(protoChain, initialObject);
}

function reduce(transform, init, collection) {
	if (!collection) return coll => reduce(transform, init, coll);
	let accumulation = init;
	return {
		'@@transducer/step': (accumulated, current) => {
			accumulation = transform(accumulation, current);
			return collection['@@transducer/step'](accumulated, current)
		},
		'@@transducer/result': (v) => accumulation,
	}
}

const seq = (transform, collection) => {
	if (!collection) return coll => seq(transform, coll);
	return t.seq(collection, transform);
}

const into = (to, transform, collection) => {
	if (!collection) return coll => into(to, transform, coll);
	return t.into(to, transform, collection);
}

const isArray = Array.isArray; 
const isFunction = (theFunction) => typeof theFunction === 'function'; 
const isObject = (theObject) => theObject instanceof Object && Object.getPrototypeOf(theObject) === Object.getPrototypeOf({}); 
const isNumber = (theNumber) => typeof theNumber === 'number'; 
const isString = (theString) => typeof theString === 'string'; 
const ensureArray = (theArray) => isArray(theArray) ? theArray : [theArray] 
const range = (n) => [...Array(n).keys()]


function measureTime(times, f) {
	let s = new Date();
  for (let index = 0; index < times; index++) {
    f();
  }
  return new Date().valueOf()-s.valueOf();
}
  
function compareTimes(title, times = 1, fns) {
	fns = typeof fns === 'object' ? fns : [fns];
	const keys = Object.keys(fns);
	const result = {};
  for (let index = 0; index < keys.length; index++) {
      let fnName = keys[index];
      result[fnName] = `${measureTime(times, fns[fnName])}ms`;
  }
  return {[title]:result};
}

module.exports = {
	// object prototypes creation
	createWith,
	deepCreateWith,
	
	//imperative
	mGet,
	mSet,
	
	// fp
	curry,
	compose,
	pipe,
	merge,
	mergeCopy,
	
	//transducers
	reduce,//: t.reduce,
	map: t.map,
  filter: t.filter,
  remove: t.remove,
  keep: t.keep,
  take: t.take,
	takeWhile: t.takeWhile,
	drop: t.drop,
	dropWhile: t.dropWhile,
	dedupe: t.dedupe,
	transduce: t.transduce,
  seq,
	into,
	
	// type helpers
	isArray,
	isFunction,
	isObject,
	isNumber,
	isString,
	ensureArray,
	range,
	deepFindKey,
	deepGet,
	deepSet,

	// benchmarks
	compareTimes,
  measureTime
};