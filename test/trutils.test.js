const trutils = require( '../index.js' );
const { assert } = require( 'chai' );
const stream = require( '../modules/types/Stream.js' );
const transducers = require( '../modules/transducers.js' );
const benchmarks = require( '../modules/benchmarks.js' );
const utils = require( '../modules/utils.js' );
const creational = require( '../modules/creational.js' );
const imperative = require( '../modules/imperative.js' );
const functions = require( '../modules/functions.js' );
const objects = require( '../modules/objects.js' );
const arrays = require( '../modules/arrays.js' );
const types = require( '../modules/types/Types.js' );

describe( 'trutils', function() {
  it.skip( 'has an object with stream implementation', () => {
    Object.keys( stream ).map( prop=>{
      assert.exists( trutils.streams[prop], prop );
      assert.equal( trutils.streams[prop], stream[prop]);
    });
  });
  it( 'has an object with transducer implementation', () => {
    Object.keys( transducers ).map( prop=>{
      assert.exists( trutils.transducers[prop], prop );
      assert.equal( trutils.transducers[prop], transducers[prop]);
    });
  });
  it( 'has merged properties from benchmarks', () => {
    Object.keys( benchmarks ).map( prop=>{
      assert.exists( trutils[prop], prop );
      assert.equal( trutils[prop], benchmarks[prop]);
    });
  });
  it( 'has merged properties from creational', () => {
    Object.keys( creational ).map( prop=>{
      assert.exists( trutils[prop], prop );
      assert.equal( trutils[prop], creational[prop]);
    });
  });
  it.skip( 'has merged properties from fp', () => {
    Object.keys( fp ).map( prop=>{
      assert.exists( trutils[prop], prop );
      assert.equal( trutils[prop], fp[prop]);
    });
  });
  it( 'has merged properties from imperative', () => {
    Object.keys( imperative ).map( prop=>{
      assert.exists( trutils[prop], prop );
      assert.equal( trutils[prop], imperative[prop]);
    });
  });
  it.skip( 'has merged properties from monoids', () => {
    Object.keys( monoids ).map( prop=>{
      assert.exists( trutils[prop], prop );
      assert.equal( trutils[prop], monoids[prop]);
    });
  });
  it.skip( 'has merged properties from types', () => {
    Object.keys( types ).map( prop=>{
      assert.exists( trutils[prop], prop );
      assert.equal( trutils[prop], types[prop]);
    });
  });
  it.skip( 'has merged properties from utils', () => {
    Object.keys( utils ).map( prop=>{
      assert.exists( trutils[prop], prop );
      assert.equal( trutils[prop], utils[prop]);
    });
  });
});