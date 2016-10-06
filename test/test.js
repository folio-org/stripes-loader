import StripesLoader from '../src/index';
import chai from 'chai';
chai.should();

const input = {
  okapi: {
    url: 'http://localhost/'
  },
  modules: {
    '../test/test-module': {
      a: 1 
    }
  }
};

describe('StripesLoader', () => {
  it('should be a function', () => {
    StripesLoader.should.be.a('function');
  });
  const output = StripesLoader(input);
  it('should return an object with an array at output.modules.app', () => {
    output.should.be.a('object');
    output.modules.should.be.a('object');
    output.modules.app.should.be.a('array');
  });
  it('should override app.a', () => {
    output.modules.app[0].a.should.equal(1);
  });
});

const t = {
  okapi: {
    url: 'http://localhost/'
  },
  modules: {
    '@folio-sample-modules/trivial': {
      a: 1 
    }
  }
};

StripesLoader(t);
