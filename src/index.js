import fs from 'fs';
import path from 'path';
import assert from 'assert';
import _ from 'lodash/core';
import { stringifyRoutes, anchorRoutes } from './routes';

function maybeReadJSON(filename) {
  try {
    let data = fs.readFileSync(filename);
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

module.exports = function(source) {
  assert(_.isObject(this.options.stripesLoader), 'stripes-loader requires an object with the modules to enable as keys at the webpack configuration key "stripesLoader"');
  const enabled = this.options.stripesLoader.modules;
  let system = { okapi: this.options.stripesLoader.okapi };
  let allMenus = {};
  let allRoutes = [];
  let occupiedTopLevelPaths = {};
  Object.keys(enabled).forEach(stripe => {
    let packageJSONPath = require.resolve(path.join(stripe, '/package.json'));
    let packageJSON = JSON.parse(fs.readFileSync(packageJSONPath));
    assert(_.isObject(packageJSON.stripes, 'included module ' + stripe
          + ' does not have a "stripes" key in package.json'));
    assert(_.isString(packageJSON.stripes.type, 'included module ' + stripe
          + ' does not specify stripes.type in package.json'));
    let stripePath = path.dirname(packageJSONPath);
    switch (packageJSON.stripes.type) {
      case 'fullpage':
        let routes = maybeReadJSON(path.join(stripePath, 'routes.json'));
        if (routes !== null) {
          //TODO fail on conflicting route
          allRoutes = allRoutes.concat(anchorRoutes(routes, stripePath));
        }

        let menus = maybeReadJSON(path.join(stripePath, 'menus.json'));
        if (menus !== null) Object.keys(menus).forEach(menu => {
          if (allMenus[menu] === undefined) allMenus[menu] = menus[menu];
          else allMenus[menu] = allMenus[menu].concat(menus[menu]);
        });
        break;
    }
  });
  let routeString = stringifyRoutes(allRoutes);
  return "module.exports = { routes: " + routeString
          + ", menus:" + JSON.stringify(allMenus)
          + ", system:" + JSON.stringify(system)
          + " };";
}
