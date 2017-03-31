'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gzip = gzip;
exports.gunzip = gunzip;

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function gzip(data) {
  return new Promise((resolve, reject) => _zlib2.default.gzip(data, (e, d) => {
    if (e) reject(e);else resolve(d);
  }));
}

function gunzip(data) {
  return new Promise((resolve, reject) => _zlib2.default.gunzip(data, (e, d) => {
    if (e) reject(e);else resolve(d);
  }));
}