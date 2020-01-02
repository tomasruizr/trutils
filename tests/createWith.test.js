const { createWith } = require( '../index' );
const assert = require( 'assert' );

let obj = {
}

describe('createWith', () => {
  it('creates and object with the prototype specified as param 1', () => {
    const x = createWith({name:'tomas', getName:()=>{return 'bla';}});
    assert(x.__proto__.getName);
    assert(x.__proto__.name);
    assert(x.__proto__.getName() === 'bla');
  })
  it('creates and object with the prototype specified as param 1 with the properties in param 2', () => {
    const x = createWith({name:'tomas', getName:()=>{return 'bla';}}, {lastName: 'ruiz'});
    assert(x.lastName);
    assert(x.lastName === 'ruiz');
  })
})
