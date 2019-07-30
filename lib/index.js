"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "dict", {
  enumerable: true,
  get: function get() {
    return _dict.dict;
  }
});
Object.defineProperty(exports, "actions", {
  enumerable: true,
  get: function get() {
    return _actions.actions;
  }
});
Object.defineProperty(exports, "model", {
  enumerable: true,
  get: function get() {
    return _model.model;
  }
});
Object.defineProperty(exports, "momnet", {
  enumerable: true,
  get: function get() {
    return _momnet.momnet;
  }
});
Object.defineProperty(exports, "permission", {
  enumerable: true,
  get: function get() {
    return _permission.permission;
  }
});
Object.defineProperty(exports, "service", {
  enumerable: true,
  get: function get() {
    return _service.service;
  }
});
Object.defineProperty(exports, "string", {
  enumerable: true,
  get: function get() {
    return _string.string;
  }
});
exports.default = exports.initGlobalDict = exports.initSysDict = exports.initUser = exports.ComponentDict = exports.globalDict = exports.sysDict = exports.user = exports.config = exports.request = void 0;

var schema = _interopRequireWildcard(require("./schema"));

var _dict = require("./dict");

var _actions = require("./actions");

var _model = require("./model");

var _momnet = require("./momnet");

var _permission = require("./permission");

var _service = require("./service");

var _string = require("./string");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let request = null;
exports.request = request;
let config = null;
exports.config = config;
let user = null;
exports.user = user;
let sysDict = null;
exports.sysDict = sysDict;
let globalDict = null;
exports.globalDict = globalDict;
let ComponentDict = {};
exports.ComponentDict = ComponentDict;

const index = (outRequest, outConfig, outComponentDict) => {
  console.log("common init start");
  exports.request = request = outRequest;
  exports.config = config = outConfig;
  exports.ComponentDict = ComponentDict = outComponentDict;
  console.log("common init end");
};
/**
 * 初始化用户
 * @param outUser
 */


const initUser = outUser => {
  exports.user = user = outUser;
};
/**
 * 初始化系统字典
 * @param value
 */


exports.initUser = initUser;

const initSysDict = value => {
  exports.sysDict = sysDict = {};
  value && value.forEach(item => {
    sysDict[item.type] || (sysDict[item.type] = listToDict(value, {
      type: item.type
    }, "value", "label"));
  });
  return sysDict;
};
/**
 *  初始化全局字典
 * @param value
 */


exports.initSysDict = initSysDict;

const initGlobalDict = value => {
  exports.globalDict = globalDict = value;
};

exports.initGlobalDict = initGlobalDict;

var _default = _objectSpread({
  init: index,
  initUser,
  initSysDict,
  initGlobalDict
}, schema);

exports.default = _default;