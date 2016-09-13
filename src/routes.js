import _ from 'lodash/core';
import path from 'path';
import assert from 'assert';

// Routes must be generated as strings so the callback functions will be interpreted
function callbackify(reqParam) {
  reqParam = reqParam.replace(/\\/g,"\\\\");
  return `function(location, callback) {
            require.ensure([], function(require) {
              callback(null, require('${reqParam}').default)
            })
          }
`;
}
export function stringifyRoute(route) {
  assert(_.isObject(route));
  let s = "{\n";
  if (_.isString(route.path)) s += 'path: "' + route.path + '",\n';
  if (_.isString(route.component)) {
    s += 'getComponent: ' + callbackify(path.join(route.moddir, route.component)) + ',\n';
  }
  if (_.isObject(route.indexRoute)) {
    route.indexRoute.moddir = route.moddir;
    s += 'indexRoute: ' + stringifyRoute(route.indexRoute) + '\n';
  }
  if (Array.isArray(route.childRoutes)) {
    anchorRoutes(route.childRoutes, route.moddir);
    s += 'childRoutes: ' + stringifyRoutes(route.childRoutes) + ',\n';
  }
  s = s.slice(0, -2); // remove trailing comma
  s += "\n},";
  return s;
}
export function stringifyRoutes(routes) {
  assert(Array.isArray(routes));
  let s = "[\n";
  routes.forEach(r => s+= stringifyRoute(r));
  s += "\n]";
  return s;
}
export function anchorRoutes(routes, moddir) {
  assert(Array.isArray(routes));
  routes.forEach(r => {
    assert(_.isObject(r));
    assert(typeof(r.moddir) === 'undefined', '"moddir" property not permitted in route');
    r.moddir = moddir;
  });
  return routes;
}

