import fs from 'fs';
import path from 'path';
import assert from 'assert';
import _ from 'lodash';
// TODO find a simpler/more robust serialisation tool to do "JSON.stringify()
// that leaves functions bare so eval() can regurgitate them eg. when used as
// a Webpack loader"
import Exval from 'exval';

const exval = new Exval();

const appendOrSingleton = (maybeArray, newValue) => {
  const singleton = [newValue];
  if (Array.isArray(maybeArray)) return maybeArray.concat(singleton);
  return singleton;
};

// Would use => here but apparently the implicit "this" binding also somehow
// prevents rebinding? I need to bind() this to test it.
module.exports = function stripesLoader() {
  assert(_.isObject(this.options.stripesLoader), 'stripes-loader requires an object with the modules to enable as keys at the webpack configuration key "stripesLoader"');
  const enabled = this.options.stripesLoader.modules;
  const output = Object.assign({}, this.options.stripesLoader);
  delete output.modules;
  output.modules = {};
  _.forOwn(enabled, (overrides, stripe) => {
    const packageJSONPath = require.resolve(path.join(stripe, '/package.json'));
    const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath));
    assert(_.isObject(packageJSON.stripes,
           `included module ${stripe} does not have a "stripes" key in package.json`));
    const defaults = packageJSON.stripes;
    assert(_.isString(defaults.type,
           `included module ${stripe} does not specify stripes.type in package.json`));
    const stripeConfig = Object.assign({}, defaults, overrides, {
      module: stripe,
      // TODO make this async ie. return a promise instead once we can handle that
      // TODO yes, this is silly, but we can't serialize the closure
      getModule: eval(`() => require('${stripe}').default`), // eslint-disable-line no-eval
      moduleRoot: path.dirname(packageJSONPath),
      description: packageJSON.description,
      version: packageJSON.version,
    });
    delete stripeConfig.type;
    output.modules[defaults.type] = appendOrSingleton(output.modules[defaults.type], stripeConfig);
  });
  return `module.exports = ${exval.stringify(output)}`;
};
