const Task = require( './Task.js' );
const { assert } = require( 'chai' );
const sinon = require( 'sinon' );

describe( 'Task', function() {
  const failSafe = () => assert( false );
  
  it( 'Holds Static properties', function() {
    assert.exists( Task.of );
    assert.exists( Task.rejected );
    assert.exists( Task.isTask );
    assert.exists( Task.ensureTask );
    assert.exists( Task.fromPromise );
  });

  describe( 'Task', function() {
    it( 'returns a Task for non async operation', () => {
      const x = new Task(( _, resolve ) => resolve( 'str' ));
      x.fork( failSafe, str => assert.equal( str, 'str' ));
    });
    it( 'returns a Task for async operation', done => {
      const x = new Task(( _, resolve ) => setTimeout(() => resolve( 'str' ), 10 ));
      x.fork( failSafe, str => {
        assert.equal( str, 'str' );
        done();
      });
    });
  });

  describe( 'of', function() {
    it( 'returns an object with isTask === true', () => {
      const x = Task.of();
      assert.isTrue( Task.isTask( x ));
    });
    it( 'returns an object with possible operations', () => {
      const x = Task.of();
      assert.exists( x.isTask );
      assert.exists( x.map ); 
      assert.exists( x.bimap );
      assert.exists( x.rejectedMap );
      assert.exists( x.swap );
      assert.exists( x.fold );
      assert.exists( x.orElse );
      assert.exists( x.chain );
      assert.exists( x.ap );
      assert.exists( x.concat );
      assert.exists( x.or );
      assert.exists( x.toString );
      assert.exists( x.fork );
    });
    describe( 'task.fork ', function() {
      it( 'forks the value of the task', () => {
        const x = Task.of( 'some string' );
        x.fork( failSafe, str => assert.equal( str, 'some string' ));
      });
    });
  });

  describe( 'rejected', function() {
    describe( 'task.fork ', function() {
      it( 'forks the value of the rejected task', () => {
        const x = Task.rejected( 'some string' );
        x.fork( str => assert.equal( str, 'some string' ), failSafe );
      });
    });
  });

  describe( 'and', function() {
    it( 'executes two async operations and returns an array with the results', done => {
      Task.and( 
        new Task(( _, resolve ) => setTimeout(() => { resolve( 1 ); }, 10 )),
        new Task(( _, resolve ) => setTimeout(() => { resolve( 2 ); }, 10 ))
      )
        .map( x=> { 
          assert.deepEqual( x, [ 1,2 ]);
          return x; 
        }) 
        .fork( done, () => done());
    });
  });
  
  describe( 'all', function() {
    it( 'executes two async operations and returns an array with the results', done => {
      Task.all( 
        new Task(( _, resolve ) => setTimeout(() => { resolve( 1 ); }, 10 )),
        new Task(( _, resolve ) => setTimeout(() => { resolve( 2 ); }, 8 )),
        new Task(( _, resolve ) => setTimeout(() => { resolve( 3 ); }, 10 )),
        new Task(( _, resolve ) => setTimeout(() => { resolve( 4 ); }, 1 )),
        new Task(( _, resolve ) => setTimeout(() => { resolve( 5 ); }, 5 ))
      )
        .map( x => {
          assert.deepEqual( x, [ 1,2,3,4,5 ]);
        })
        .fork( done, () => done());
    });
  });

  describe( 'task.map', function() {
    it( 'maps the value of a task', () => {
      Task.of( 10 )
        .map( num => num + 5 )
        .fork( failSafe, num => assert.equal( num, 15 ));
    });
    it( 'maps the value of a task', () => {
      Task.of( 10 )
        .map( num => num + 5 )
        .map( num => num + 5 )
        .map( num => num + 5 )
        .map( num => num + 5 )
        .fork( failSafe, num => assert.equal( num, 30 ));
    });
  });

  describe( 'task.chain', function() {
    it( 'chains the value of a task if chain function returns a task', () => {
      Task.of( 10 )
        .chain( num => Task.of( num + 5 ))
        .fork( failSafe, num => assert.equal( num, 15 ));
    });
    it( 'chains the value of a task if chain function returns a non task value', () => {
      Task.of( 10 )
        .chain( num => num + 5 )
        .fork( failSafe, num => assert.equal( num, 15 ));
    });
    it( 'chains the value of a task if chain function returns a Promise', () => {
      Task.of( 10 )
        .chain( num => Promise.resolve( num + 5 ))
        .fork( failSafe, num => assert.equal( num, 15 ));
    });
  });

  describe( 'task.bimap', function() {
    it( 'makes a map operation if resolved', done => {
      Task.of( 'str' )
        .bimap( str => str.toUpperCase())
        .map( str => {
          assert.equal( str, 'STR' );
        }).fork( failSafe, () => done());
    });
    it( 'makes a map operation if rejected', done => {
      Task.rejected( 'str' )
        .bimap( str => str.toUpperCase())
        .rejectedMap( str => {
          assert.equal( str, 'STR' );
        }).fork(() => done(), failSafe );
    });
  });
  
  describe( 'task.fold', function() {
    it( 'makes a rejectedMap operation if resolved', done => {
      Task.of( 'str' )
        .fold( str => str.toUpperCase())
        .map( str => {
          assert.equal( str, 'STR' );
        }).fork( failSafe, () => done());
    });
    it( 'makes a map operation if resolved', done => {
      Task.of( 'str' )
        .fold( failSafe, str => str.toUpperCase())
        .map( str => {
          assert.equal( str, 'STR' );
        }).fork( failSafe, () => done());
    });
    it( 'makes a map operation if rejected and resolved the result', done => {
      Task.rejected( 'str' )
        .fold( str => str.toUpperCase())
        .map( str => {
          assert.equal( str, 'STR' );
        }).fork( failSafe, () => done());
    });
    it( 'makes a rejectedMap operation if rejected and resolved the result', done => {
      Task.rejected( 'str' )
        .fold(() => 'the rejected map op', failSafe )
        .map( str => {
          assert.equal( str, 'the rejected map op' );
        }).fork( failSafe, () => done());
    });
  });

  describe( 'task.rejectedChain', function() {
    it( 'does nothing if resolved', done => {
      Task.of( 'str' )
        .orElse( str => str.toUpperCase())
        .map( str => {
          assert.equal( str, 'str' );
        }).fork( failSafe, () => done());
    });
    it( 'makes a chain operation if rejected', done => {
      Task.rejected( 'str' )
        .orElse( str => Task.of( str.toUpperCase()))
        .map( str => {
          assert( str, 'STR' );
        }).fork( failSafe, () => done());
    });
  });

  describe( 'task.rejectedChain', function() {
    it( 'does nothing if resolved', done => {
      Task.of( 'str' )
        .orElse( str => str.toUpperCase())
        .map( str => {
          assert.equal( str, 'str' );
        }).fork( failSafe, () => done());
    });
    it( 'makes a chain operation if rejected', done => {
      Task.rejected( 'str' )
        .orElse( str => Task.of( str.toUpperCase()))
        .map( str => {
          assert( str, 'STR' );
        }).fork( failSafe, () => done());
    });
  });

  describe( 'task.swap', function() {
    it( 'rejects a resolved task', done => {
      Task.of( 'str' )
        .swap()
        .rejectedMap( str => {
          assert.equal( str, 'str' );
        }).fork(() => done(), failSafe );
    });
    it( 'resolves a rejected task', done => {
      Task.rejected( 'str' )
        .swap()
        .map( str => {
          assert.equal( str, 'str' );
        }).fork( failSafe, () => done());
    });
  });

  describe( 'task.ap', function() {
    it( 'resolves two Tasks applied to another task', done => {
      Task.of( one => two => `${one}-${two}` )
        .ap( Task.of( 'hola' ))
        .ap( Task.of( 'pana' ))
        .map( data => {
          assert.equal( data, 'hola-pana' );
        })
        .fork( done, () => done());
    });
    it( 'rejects if one of the ap functions rejects', () => {
      Task.of( one => two => `${one}-${two}` )
        .ap( Task.of( 'hola' ))
        .ap( Task.rejected( 'pana' ))
        .fork( err => assert.equal( err, 'pana' ), failSafe );
    });
    it( 'works after maps for async ops', () => {
      Task.of( 'mio' )
        .map( str => str.toUpperCase())
        .map( a => b => c => a + b + c )
        .ap( new Task(( _, resolve ) => setTimeout(() => resolve( 'hola' )), 5 ))
        .ap( new Task(( _, resolve ) => setTimeout(() => resolve( 'pana' )), 5 ))
        .fork( failSafe, str => {
          assert.equal( str, 'MIOholapana' );
        });
    });
    it( 'works for several async ops', done => {
      const spy = sinon.spy();
      Task.of(() => () => 'listo' )
        .ap( new Task(( _, resolve )=> setTimeout(() => { spy(); resolve(); }, 200 )))
        .ap( new Task(( _, resolve )=> setTimeout(() => { spy(); resolve(); }, 100 )))
        .map( str => {
          assert.equal( str, 'listo' );
          assert.equal( spy.callCount, 2 );
        })
        .fork( done, () => done());
    });
    it( 'rejects for several async ops', done => {
      const spy = sinon.spy();
      Task.of(() => () => 'listo' )
        .ap( new Task(( reject )=> setTimeout(() => { spy(); reject( 'rejectedValue' ); }, 200 )))
        .ap( new Task(( _, resolve )=> setTimeout(() => { spy(); resolve(); }, 100 )))
        .rejectedMap( str => {
          assert.equal( str, 'rejectedValue' );
          assert.equal( spy.callCount, 2 );
        })
        .fork(() => done(), done );
    });
  });

  describe( 'task.and', function() {
    it( 'executes several async operations and returns an array with the results', done => {
      Task.of()
        .and( new Task(( _, resolve ) => setTimeout(() => { resolve( 1 ); }, 10 )))
        .and( new Task(( _, resolve ) => setTimeout(() => { resolve( 2 ); }, 8 )))
        .and( new Task(( _, resolve ) => setTimeout(() => { resolve( 3 ); }, 6 )))
        .and( new Task(( _, resolve ) => setTimeout(() => { resolve( 4 ); }, 3 )))
        .map( x=> { 
          assert.deepEqual( x, [ 1,2,3,4 ]);
        }) 
        .fork( done, () => done());
    });
    it( 'executes several async operations and returns an array with the results', done => {
      Task.of( 'someThing' )
        .and( new Task(( _, resolve ) => setTimeout(() => { resolve( 1 ); }, 10 )))
        .and( new Task(( _, resolve ) => setTimeout(() => { resolve( 2 ); }, 8 )))
        .and( new Task(( _, resolve ) => setTimeout(() => { resolve( 3 ); }, 6 )))
        .and( new Task(( _, resolve ) => setTimeout(() => { resolve( 4 ); }, 3 )))
        .map( x=> { 
          assert.deepEqual( x, [ 'someThing', 1,2,3,4 ]);
        }) 
        .fork( done, () => done());
    });
  });

  describe( 'task.effect', function() {
    it( 'performs a side effect operation but passes the current state to next step', done => {
      const spy = sinon.spy();
      Task.of( 'some data' )
        .map( x=> x.toUpperCase())
        .effect( spy )
        .map( str=> {
          assert.equal( str, 'SOME DATA' );
          assert.isTrue( spy.called );
          assert.isTrue( spy.calledWith( 'SOME DATA' ));
        })
        .fork( done, () => done());
    });
    it( 'performs a side effect operation but passes the current state to next step', done => {
      const spy = sinon.spy();
      Task.of( 'some data' )
        .map( x=> x.toUpperCase())
        .effect(() => spy())
        .map( str=> {
          assert.equal( str, 'SOME DATA' );
          assert.isTrue( spy.called );
          assert.deepEqual( spy.args, [[]]);
        })
        .fork( done, () => done());
    });
  });
});