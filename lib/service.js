"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createBasicApi = createBasicApi;
exports.createApi = createApi;

var _queryString = _interopRequireDefault(require("query-string"));

var _index = require("./index");

var _schema = require("./schema");

var _actions = _interopRequireDefault(require("./actions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createBasicApi(module, subModule) {
  return {
    get: async function get() {
      let args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      const response = await (0, _index.request)({
        method: "GET",
        url: ("/" + _index.config.apiVersion + module + (args.id ? "/" + args.id : "") + (subModule ? "/" + subModule + "/" : "") + "/?" + _queryString.default.stringify(_objectSpread({}, args, {
          token: _index.user && _index.user.user && _index.user.user.token
        }))).replace("//", "/")
      });
      return response;
    },
    put: args => {
      return (0, _index.request)({
        method: "PUT",
        url: ("/" + _index.config.apiVersion + module + "/" + (args.id ? args.id : "") + (subModule ? "/" + subModule + "/" : "")).replace("//", "/"),
        data: args
      });
    },
    patch: args => {
      return (0, _index.request)({
        method: "PATCH",
        url: ("/" + _index.config.apiVersion + module + "/" + (args.id ? args.id : "") + (subModule ? "/" + subModule + "/" : "")).replace("//", "/"),
        data: args
      });
    },
    post: args => (0, _index.request)({
      method: "POST",
      url: ("/" + _index.config.apiVersion + module + (subModule ? "/" + subModule + "/" : "")).replace("//", "/"),
      data: args
    })
  };
}
/**
 *
 * @param module
 * @param schema
 * @param options 选项
 * @returns {{patch: (function(*=): *), post: (function(*=): *), get: (function(*=): {pagination: {current, total, pageSize}, list: *}), delete: (function(*): *), put: (function(*=): *)}}
 */


function createApi(module) {
  let schema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return {
    getExtend: async function getExtend() {
      let args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      let inSchema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : schema;
      // convert moment
      let params = {};
      Object.keys(args).forEach(key => {
        const item = args[key];

        if (item === undefined) {
          return;
        }

        params[key] = item && item.unix ? item.unix() : item;
      });

      let {
        currentPage,
        pageSize
      } = args,
          otherParams = _objectWithoutProperties(args, ["currentPage", "pageSize"]);

      const response = await (0, _index.request)({
        method: "GET",
        url: "/" + _index.config.apiVersion + module + "?" + _queryString.default.stringify(_objectSpread({}, otherParams, {
          page: currentPage || 1,
          limit: pageSize || 10
        }))
      });
      let {
        total,
        records
      } = response || {};
      records = records || response;
      return {
        list: inSchema ? (0, _schema.convertFromRemote)(records || [], inSchema || schema) : records,
        pagination: {
          current: currentPage,
          pageSize,
          total
        }
      };
    },
    get: async function get() {
      let args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      let inSchema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : schema;
      // convert moment
      let params = {};
      Object.keys(args).forEach(key => {
        const item = args[key];

        if (item === undefined) {
          return;
        }

        params[key] = item && item.unix ? item.unix() : item;
      });

      let {
        currentPage,
        pageSize
      } = args,
          otherParams = _objectWithoutProperties(args, ["currentPage", "pageSize"]);

      const response = await (0, _index.request)({
        method: "GET",
        url: ("/" + _index.config.apiVersion + module + "/bulk?" + _queryString.default.stringify(_objectSpread({
          sort: "-id"
        }, otherParams, {
          page: currentPage || 1,
          limit: pageSize || 10
        }))).replace("//", "/")
      }, _objectSpread({}, options));
      const {
        total,
        records
      } = response || {};
      return {
        list: inSchema ? (0, _schema.convertFromRemote)(records || [], inSchema || schema) : records,
        pagination: {
          current: currentPage,
          pageSize,
          total
        }
      };
    },
    getDetail: async function getDetail() {
      let args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      let inSchema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : schema;
      const {
        id
      } = args;
      const response = await (0, _index.request)({
        method: "GET",
        url: ("/" + _index.config.apiVersion + module + "/" + id).replace("//", "/")
      }, _objectSpread({}, options));

      const {
        result
      } = response,
            others = _objectWithoutProperties(response, ["result"]);

      return _objectSpread({
        result: (0, _schema.convertFromRemote)(result, inSchema)
      }, others);
    },
    post: function post(args) {
      let inSchema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : schema;
      return (0, _index.request)({
        method: "POST",
        url: ("/" + _index.config.apiVersion + module).replace("//", "/"),
        data: (0, _schema.convertToRemote)(args, inSchema || schema, _actions.default.add)
      });
    },
    patch: function patch(args) {
      let inSchema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : schema;
      return (0, _index.request)({
        method: "PATCH",
        url: ("/" + _index.config.apiVersion + module).replace("//", "/"),
        data: (0, _schema.convertToRemote)(args, inSchema || schema)
      });
    },
    put: function put(args) {
      let inSchema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : schema;
      return (0, _index.request)({
        method: "PUT",
        url: "/" + _index.config.apiVersion + module,
        data: (0, _schema.convertToRemote)(args, inSchema || schema)
      });
    },
    delete: args => (0, _index.request)({
      method: "DELETE",
      url: ("/" + _index.config.apiVersion + module + "/" + args.id).replace("//", "/")
    })
  };
}