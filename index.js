function monad(obj, objectPath, nValue, params = {}) {
	const {arrayPush, doNotCreate} = params;
	const parts = Array.isArray(objectPath) ? objectPath : objectPath.split('.');
	const part = parts.shift();
	if (nValue !== undefined) {
		if (parts.length) {
			if (!doNotCreate && obj[part] === undefined) obj[part] = {};
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

function validateParams(obj, objectPath) {
	if (!obj) return obj;
	if (typeof obj !== 'object') throw new Error('The first argument must be an object');
	if (typeof objectPath !== 'string' && !Array.isArray(objectPath)) throw new Error(`The object Path must be a string in the format 'x.y.z' or an array ['x','y','z']`);
}


function mExists(obj, objectPath) {
	validateParams(obj, objectPath);
	return !!monad(obj, objectPath);
}

function mGet(obj, objectPath) {
	validateParams(obj, objectPath);
	return obj ? monad(obj, objectPath) : obj;
}

function mSet(obj, objectPath, nValue, cascadeCreate = false, arrayPush = false) {
	validateParams(obj, objectPath);
	return monad(obj, objectPath, nValue, cascadeCreate, arrayPush);
}


function findKey(obj, key) {
	const keys = Object.keys(obj);
	let val;
	if (keys.includes(key)) return obj[key];
	for (const k of keys) {
		if (typeof obj[k] === 'object') {
			val = findKey(obj[k], key);
			if (val) return val;
		}
	}
}

function createWith(proto, properties){
	return Object.assign(Object.create(proto), properties);
}

function compose(protos, initialObject = {}){
	protos = Array.isArray(protos) ? protos : [protos];
	const protoChain = protos.reverse().reduce((acc, current) => {
		return Object.setPrototypeOf(current, acc);
	}, {})
	return createWith(protoChain, initialObject);
}



module.exports = {
	mExists,
	mGet,
	mSet,
	findKey,
	createWith,
	compose
};