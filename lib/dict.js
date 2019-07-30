"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addRemark = addRemark;
exports.convertDict = convertDict;
exports.getDictValue = getDictValue;
exports.reverseDictValue = reverseDictValue;
exports.listToDict = listToDict;
exports.getSysDict = getSysDict;
exports.default = void 0;

var _index = require("./index");

var _schema = require("./schema");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = {
  yesOrNo: {
    yes: {
      value: "1",
      remark: "是"
    },
    no: {
      value: "0",
      remark: "否"
    }
  },
  yesOrNoNum: {
    yes: {
      value: 1,
      remark: "是"
    },
    no: {
      value: 0,
      remark: "否"
    }
  },
  level: {
    normal: {
      value: "normal",
      remark: "正常",
      default: true
    },
    warn: {
      value: "warn",
      remark: "告警"
    },
    error: {
      value: "error",
      remark: "错误"
    },
    disable: {
      value: "disable",
      remark: "禁用"
    }
  }
  /**
   * add remark to obj
   * @param obj
   * @param dict
   * @returns {any[]}
   */

};
exports.default = _default;

function addRemark(obj) {
  let model = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (obj instanceof Array) {
    obj.forEach(item => {
      Object.keys(model).forEach(key => {
        model[key].dict && (item[key + "_remark"] = convertDict(item[key], model[key].dict, model[key].type !== _schema.schemaFieldType.Select));
      });
    });
  } else {
    Object.keys(model).forEach(key => {
      model[key].dict && (obj[key + "_remark"] = convertDict(obj[key], model[key].dict, model[key].type !== _schema.schemaFieldType.Select));
    });
  }

  return obj;
}
/**
 * convert value to dict reamrk
 * @param value
 * @param dict
 * @returns {*}
 */


function convertDict(value, dict) {
  let split = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  let result = null;

  if (typeof value === "string" && value) {
    const list = split ? value.split && value.split(",") : [value];
    result = list.map(value => getDictValue(value, dict));
    result = result.join();
  } else {
    result = getDictValue(value, dict);
  }

  return result;
}
/**
 * get the dict map value
 * @param value
 * @param dict
 * @returns {*}
 */


function getDictValue(value, dict) {
  let result = null;
  Object.keys(dict).some(key => {
    if (value !== undefined && value !== null) {
      String(value) == String(dict[key].value) && (result = dict[key].remark);
    }

    return result;
  });
  return result;
}
/**
 * 反向转换备注为数值
 * @param remark
 * @param dict
 */


function reverseDictValue(remark, dict) {
  let result = null;
  Object.keys(dict).some(key => {
    if (remark !== undefined && remark !== null) {
      String(remark) == String(dict[key].remark) && (result = dict[key].value);
    }

    return result;
  });
  return result;
}
/**
 * convert list data to schema dict
 * @param list
 */

/**
 *
 * @param list 转换的列表
 * @param condition 过滤条件
 * @param idKey 作为id 的key数值
 * @param remarkKey 作为remark的数值
 * @param showCondition 显示条件 key state校验的key，valueKey item的取值key
 */


function listToDict(list, condition) {
  let idKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "id";
  let remarkKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "name";
  let showCondition = arguments.length > 4 ? arguments[4] : undefined;
  let result = {};

  if (!list) {
    console.warn("listToDict list not data");
    return result;
  }

  list.forEach(item => {
    //check the dict Whether it matches
    if (condition) {
      if (Object.keys(condition).some(key => {
        return item[key] !== condition[key];
      })) {
        return;
      }
    } // 设置显示逻辑


    if (showCondition) {
      const {
        key,
        valueKey
      } = showCondition;

      if (key && item[valueKey]) {
        var tempCondition = {};
        tempCondition[key] = item[valueKey];
      }
    } // 返回


    result[item[idKey]] = _objectSpread({}, item, {
      value: item[idKey],
      remark: item[remarkKey],
      condition: tempCondition
    });
  });
  return result;
}
/**
 * 获取系统字典
 * @param type
 */


function getSysDict(type) {
  return _index.sysDict[type];
}