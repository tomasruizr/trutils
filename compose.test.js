const { compose } = require( './index' );
const assert = require( 'assert' );

let obj = {
}

describe('compose', () => {
  it('creates and object with a prototypes specified as param 1', () => {
    const x = compose({name:'tomas', getName:()=>{return 'bla';}});
    assert(x.__proto__.getName);
    assert(x.__proto__.name);
  })
  it('creates and object with the chain of prototypes specified as param 1', () => {
    const x = compose([{name:'tomas', getName:()=>{return 'bla';}}, {lastName:'el last'}]);
    assert(x.__proto__.getName);
    assert(x.__proto__.name);
    assert(x.__proto__.getName() === 'bla');
    assert(x.__proto__.__proto__.lastName);
    assert(x.__proto__.__proto__.lastName === 'el last');
  })
  it('creates and object with the chain of prototypes specified as param 1 with the properties in param 2', () => {
    const x = compose([{name:'tomas', getName:()=>{return 'bla';}}, {lastName:'el last'}], {greetings: 'hello', getSomething:()=>{return 'something'}});
    assert(x.greetings);
    assert(x.getSomething() === 'something');
  })
})
