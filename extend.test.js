const { extend, createNew } = require('./index');
const assert = require( 'assert' );

let proto1 = function(initVal){
	this.name = 'someName1';
	this.lastName = 'someLastname';
	this.initVar = initVal;
}
proto1.prototype.someFunction1 = function someFunction1() {
	return "someFunction1"
}
let proto2 = function(initVal){
	proto1.call(this, initVal);
	this.name = 'someName2';
}
proto2.prototype.someFunction2 = function someFunction2() {
	return "someFunction2"
}
extend(proto2, proto1);

describe('extend', function() {
	const p1 = Object.create(proto1);
	const p2 = new proto2("someVal");
	it('inherit properties from one proto to another',() => {
		assert.equal(!!p2.lastName, true);
		assert.equal(!!p2.initVar, true);
		assert.equal(!!p2.initVar, true);
		assert.equal(!!p2.someFunction1, true);
		assert.equal(p2.initVar, "someVal");
	});
	it('has both prototype functions and props', () => {
		assert.equal(p2.name, "someName2");
		assert.equal(!!p2.someFunction2, true);
	});
	it('has the constructor property of child proto', () => {
		assert.equal(p2.constructor.name, "proto2");
	});
});
