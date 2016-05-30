import StripesLoader from '../src/index';
import chai from 'chai';
chai.should();

const mockWebpackThis = {
  options: {
    stripesLoader: {
      "../test/test-module":{}
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
  it('after evaluating output, modules.exports.routes[0].getComponent should be a function', () => {
    eval(output);
    module.exports.routes[0].getComponent.should.be.a('function');
  });
});
