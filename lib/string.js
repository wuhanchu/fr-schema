"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toHump = toHump;
exports.toLine = toLine;

// 下划线转换驼峰
function toHump(name) {
  return name.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
} // 驼峰转换下划线


function toLine(name) {
  return name.replace(/([A-Z])/g, "_$1").toLowerCase();
}