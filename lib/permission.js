"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("./index");

const types = {
  finance: {
    approval: "approval"
  }
};
let config = {
  admin: types,
  manager: types,
  regular: []
};

const check = (permission, scope) => {
  scope = scope || config[_index.user.user.role];

  if (scope instanceof Array) {
    return scope.some(item => check(permission, item));
  } else if (scope instanceof Object) {
    return Object.values(scope).some(item => check(permission, item));
  } else {
    return permission === scope;
  }
};

var _default = {
  types,
  config,
  check
};
exports.default = _default;