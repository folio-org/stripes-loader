import fs from 'fs';
import path from 'path';
import assert from 'assert';
import _ from 'lodash';

const appendOrSingleton = (maybeArray, newValue) => {
  const singleton = [newValue];
  if (Array.isArray(maybeArray)) return maybeArray.concat(singleton);
  return singleton;
};

module.exports = (config, validators = {}) => {
  assert(_.isObject(config) && _.isObject(config.modules),
         'stripes-loader requires an object with the modules to enable as keys');
  const enabled = config.modules;
  const output = Object.assign({}, config);
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
      moduleRoot: path.dirname(packageJSONPath),
      modulePackageJSON: packageJSON,
    });
    delete stripeConfig.type;
    output.modules[defaults.type] = appendOrSingleton(output.modules[defaults.type], stripeConfig);
  });
  console.log(output.modules);
  return output;
};
