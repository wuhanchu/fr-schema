"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isJson = isJson;

function isJson(str) {
  if (typeof str == "string") {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
}