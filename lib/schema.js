"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSchemaShow = getSchemaShow;
exports.getInfoColumn = getInfoColumn;
exports.convertFromRemote = convertFromRemote;
exports.convertToRemote = convertToRemote;
exports.getPrimaryKey = getPrimaryKey;
exports.convertFormImport = convertFormImport;
exports.decorateList = decorateList;
exports.decorateItem = decorateItem;
exports.schemaFieldType = void 0;

var _actions = _interopRequireDefault(require("./actions"));

var _moment = _interopRequireDefault(require("moment"));

var _momnet = require("./momnet");

var _dict = require("./dict");

var _asyncValidator = _interopRequireDefault(require("async-validator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * schema字段类型
 * @type {{Select: string}}
 */
const schemaFieldType = {
  Select: "Select",
  MultiSelect: "MultiSelect",
  DatePicker: "DatePicker",
  RangePicker: "RangePicker",
  TextArea: "TextArea",
  Password: "Password",
  TreeSelect: "TreeSelect",
  Slider: "Slider",
  Table: "Table",
  Input: "Input",
  InputNumber: "InputNumber"
  /**
   * 获取只读对象
   */

};
exports.schemaFieldType = schemaFieldType;

function getSchemaShow(schema) {
  let result = {};
  Object.keys(schema).forEach(key => {
    result[key] = _objectSpread({}, schema[key], {
      readOnly: true,
      partialUpdate: false,
      required: false
    });
  });
  return result;
}
/**
 * get the info show column
 * @param schema
 * @returns {Array}
 */


function getInfoColumn(schema) {
  let infoAction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _actions.default.add;
  let result = [];
  Object.keys(schema).forEach(key => {
    if (infoAction === _actions.default.add && schema[key].addHide) {
      return;
    }

    if (infoAction === _actions.default.update && schema[key].editHide) {
      return;
    }

    if (infoAction === _actions.default.show && schema[key].showHide) {
      return;
    }

    !schema[key].infoHide && result.push(_objectSpread({
      dataIndex: key
    }, schema[key]));
  });
  result.sort(function (a, b) {
    return (a.orderIndex === undefined || a.orderIndex === null ? 9999 : a.orderIndex) - (b.orderIndex === undefined || b.orderIndex === null ? 9999 : b.orderIndex);
  });
  return result;
}
/**
 * convert the data from remote server
 * @param data
 * @param schema
 * @returns {*}
 */


function convertFromRemote(data, schema) {
  let result = null;

  if (!data) {
    return null;
  }

  if (data instanceof Array) {
    result = data.map(item => formRemote(item, schema));
  } else {
    result = formRemote(data, schema);
  }

  return result;
}
/**
 * single item convert form remote
 * @param item
 * @param schema
 * @returns {{[p: string]: *}}
 */


function formRemote(item, schema) {
  let result = _objectSpread({}, item);

  Object.keys(schema).forEach(key => {
    if (!item[key] || !schema[key]) {
      return;
    }

    switch (schema[key].type) {
      case schemaFieldType.DatePicker:
        let value = item[key];

        if (!value) {
          return null;
        }

        const reg = /^[\d]+$/;

        if (reg.test(value)) {
          value = parseInt(item[key]);
        }

        result[key] = typeof value === "number" ? _moment.default.unix(value) : (0, _moment.default)(value);
        break;
    } // 除数


    if (schema[key].divisor) {
      result[key] = result[key] && result[key] / schema[key].divisor;
    }

    if (schema[key].decimal) {
      result[key] = result[key] !== undefined && result[key] !== null && Number.parseFloat(result[key]).toFixed(schema[key].decimal);
    }
  });
  return result;
}
/**
 * 把数据根据定义转换成远程服务要求数据
 * @param item 数据
 * @param schema 数据定义
 * @param action 操作
 * @returns {*}
 */


function toRemote(item, schema) {
  let action = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _actions.default.edit;

  if (!schema) {
    return item;
  }

  let result = _objectSpread({}, item);

  Object.keys(schema).forEach(key => {
    if (action === _actions.default.edit && schema[key].readOnly && !schema[key].primaryKey) {
      delete result[key];
      return;
    }

    if (!item[key]) {
      return;
    }

    switch (schema[key].type) {
      case "DatePicker":
        result[key] = (0, _moment.default)(item[key]).valueOf();
        break;

      default:
    }
  });
  return result;
}
/**
 * 批量转换数据为远程数据
 * @param data
 * @param schema
 * @param action
 * @returns {*}
 */


function convertToRemote(data, schema) {
  let action = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _actions.default.edit;
  let result = null;

  if (data instanceof Array) {
    result = data.map(item => toRemote(item, schema, action));
  } else {
    result = toRemote(data, schema, action);
  }

  return result;
}
/**
 * 获取主键key
 * @param schema
 */


function getPrimaryKey(schema) {
  let primaryKey = "id";
  Object.keys(schema).some(key => {
    if (schema[key].primaryKey) {
      primaryKey = key;
      return true;
    }
  });
  return primaryKey;
}
/**
 * 转换到excel文件中导入的数据
 * @param data
 * @param schema
 */


async function convertFormImport(data, schema) {
  // 转换schema 根据 中文标题做key
  let convertMap = {};
  Object.keys(schema).forEach(dataIndex => {
    const fieldDefine = schema[dataIndex];
    convertMap[fieldDefine.title] = _objectSpread({}, schema[dataIndex], {
      dataIndex
    });
  }); // 添加 A,B,C，D... 等的匹配

  Object.keys(data[0]).forEach(key => {
    convertMap[key] = convertMap[data[0][key]];
  }); // 生成validate descriptor

  let descriptor = {};
  Object.keys(schema).forEach(key => {
    const {
      required,
      rules
    } = schema[key];
    descriptor[key] = _objectSpread({
      type: "string",
      required
    }, rules || {});
  }); // 批量验证

  const dataResult = [];
  let throwMessage = null;
  data.slice(1).some(async item => {
    let result = {};
    Object.keys(item).forEach(key => {
      const filedDefine = convertMap[key];

      if (!filedDefine) {
        return;
      }

      if (filedDefine.addHide) {
        return;
      } // 获取key


      const realKey = filedDefine.dataIndex;

      if (!realKey) {
        return;
      } // 获取值


      let value = item[key];

      if (filedDefine.dict) {
        value = (0, _dict.reverseDictValue)(value, filedDefine.dict);
      }

      result[realKey] = value;
    }); //  校验

    await new _asyncValidator.default(descriptor).validate(result, (errors, fields) => {
      if (errors) {
        console.error("item", item);
        console.error("errors", errors);
        console.error("fields", fields);
        let errorStr = "";
        errors.forEach(error => {
          errorStr += "\u5B57\u6BB5[".concat(schema[error.field].title, "]\u9519\u8BEF[").concat(error.message, "];");
        });
        throwMessage = "\u6570\u636E\u8D44\u6E90\u7F16\u7801[".concat(result.sensorId, "]\u51FA\u73B0\u95EE\u9898: ").concat(errorStr, "\u3002");
      }
    });
    dataResult.push(toRemote(result, schema, _actions.default.add));
    return throwMessage;
  });

  if (throwMessage) {
    throw new Error(throwMessage);
  }

  return dataResult;
}
/**
 * docorate list show Humanize
 * @param list
 * @param schema
 * @returns {*|any[]}
 */


function decorateList(list, schema) {
  const result = list.map(item => {
    return decorateItem(item, schema);
  });
  return result;
}
/**
 * 渲染单个数据
 * @param list
 * @param schema
 * @returns {any[]}
 */


function decorateItem(item, schema) {
  // 检查
  if (!schema || !item) {
    return item;
  }

  let result = _objectSpread({}, item);

  result = (0, _dict.addRemark)(result, schema);
  Object.keys(schema).forEach(key => {
    switch (schema[key].type) {
      case "DatePicker":
        if (!item[key]) {
          break;
        }

        if (!item[key].format) {
          break;
        }

        if (schema[key].props && schema[key].props.showTime) {
          result[key + "_remark"] = item[key] && item[key].format(_momnet.DATE_TIME_FORMAT);
        } else {
          result[key + "_remark"] = item[key] && item[key].format(_momnet.DATE_FORMAT);
        }

        break;

      default:
        if (schema[key].unit) {
          result[key + "_remark"] = item[key] !== null && item[key] !== undefined && item[key] + schema[key].unit;
        }

    }
  });
  return result;
}