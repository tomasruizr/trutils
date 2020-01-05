const t = require('../index.js');
const {assert} = require('chai');
describe('types utils', function() {
  describe('isObject', function() {
    it('returns true if is plain object', () => {
      assert.isTrue(t.isObject({}));
    });
    it('returns true if is object with functions', () => {
      assert.isTrue(t.isObject({a:() => {}}));
    });
    it('returns false if is array', () => {
      assert.isFalse(t.isObject([]));
    });
    it('returns false if Date', () => {
      assert.isFalse(t.isObject(new Date()));
    });
    it('returns false if Class Instance', () => {
      const c = class x{};
      const cInstance = new c();
      assert.isFalse(t.isObject(cInstance));
    });
  });

  describe('isNumer', function() {
    it('returns true when number', () => {
      assert.isTrue(t.isNumber(1));
      assert.isTrue(t.isNumber(1.1));
      assert.isTrue(t.isNumber(0.2));
      assert.isTrue(t.isNumber(10e6));
    });
    it('returns false when is not a number', () => {
      assert.isFalse(t.isNumber(10n));
      assert.isFalse(t.isNumber(undefined));
      assert.isFalse(t.isNumber(null));
      assert.isFalse(t.isNumber({}));
      assert.isFalse(t.isNumber([]));
      assert.isFalse(t.isNumber('3'));
    });
  });
  describe('isString', function() {
    it('returns true when string', () => {
      assert.isTrue(t.isString('1'));
      assert.isTrue(t.isString('asdf'));
    });
    it('returns false when is not a string', () => {
      assert.isFalse(t.isString(3));
      assert.isFalse(t.isString(10n));
      assert.isFalse(t.isString(undefined));
      assert.isFalse(t.isString(null));
      assert.isFalse(t.isString({}));
      assert.isFalse(t.isString([]));
    });
  });
  describe('ensureArray', function() {
    it('returns an array with the value passed as param if is not array', () => {
      assert.deepEqual([3],t.ensureArray(3));
      assert.deepEqual([10n],t.ensureArray(10n));
      assert.deepEqual([undefined],t.ensureArray(undefined));
      assert.deepEqual([null],t.ensureArray(null));
      assert.deepEqual([{}],t.ensureArray({}));
      assert.deepEqual(['1'],t.ensureArray('1'));
      assert.deepEqual(['asdf'],t.ensureArray('asdf'));
    });
    it('returns the same value if array passed', () => {
      assert.deepEqual([3],t.ensureArray([3]));
      assert.deepEqual([10n],t.ensureArray([10n]));
      assert.deepEqual([undefined],t.ensureArray([undefined]));
      assert.deepEqual([null],t.ensureArray([null]));
      assert.deepEqual([{}],t.ensureArray([{}]))
      assert.deepEqual(['1'],t.ensureArray(['1']));
      assert.deepEqual(['asdf'],t.ensureArray(['asdf']));
    });
  });
  
});