import StripesLoader from '../src/index';
import chai from 'chai';
chai.should();

const mockWebpackThis = {
  options: {
    stripesLoader: {
      okapi: {
        url: 'http://localhost/'
      },
      modules: {
        '../test/test-module': {
          a: 1 
        }
      }
    }
  }
};

describe('StripesLoader', () => {

  it('should be a function', () => {
    StripesLoader.should.be.a('function');
  });

  const output = StripesLoader.bind(mockWebpackThis)();

  it('should return a string', () => {
    output.should.be.a('string');
  });

  eval(output);

  it('output should evalute to an object called "module"', () => {
    module.should.be.a('object');
  });

  const app = module.exports.modules.app[0];

  it('module.exports.modules.app[0].getModule() should load main', () => {
    app.getModule.should.be.a('function');
    app.getModule().test.should.equal('test');
  });

  it('should override app[0].a', () => {
    app.a.should.equal(1);
  });
});
