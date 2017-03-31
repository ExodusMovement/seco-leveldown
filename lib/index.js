'use strict';

var _util = require('util');

var _gzip = require('./gzip');

var _abstractLeveldown = require('abstract-leveldown');

var _secoRw = require('seco-rw');

var _secoRw2 = _interopRequireDefault(_secoRw);

var _pathExists = require('path-exists');

var _pathExists2 = _interopRequireDefault(_pathExists);

var _pQueue = require('p-queue');

var _pQueue2 = _interopRequireDefault(_pQueue);

var _pWaitFor = require('p-wait-for');

var _pWaitFor2 = _interopRequireDefault(_pWaitFor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// constructor, passes through the 'location' argument to the AbstractLevelDOWN constructor
function SecoDOWN(location) {
  if (!(this instanceof SecoDOWN)) return new SecoDOWN(location);
  this._writeQueue = new _pQueue2.default({ concurrency: 1 });
  _abstractLeveldown.AbstractLevelDOWN.call(this, location);
}

SecoDOWN.prototype._open = function (opts, cb) {
  var _this = this;

  callback(_asyncToGenerator(function* () {
    // If the password isn't set, default to an empty Buffer
    // Needs to be this way for testing
    opts.passphrase = opts.passphrase || Buffer.from('');
    _this._seco = (0, _secoRw2.default)(_this.location, opts.passphrase, opts.header);
    if (!(yield (0, _pathExists2.default)(_this.location)) && opts.createIfMissing) {
      yield _this._seco.write((yield (0, _gzip.gzip)('{}')));
      _this._data = {};
    } else {
      if (opts.errorIfExists) throw new Error('Database file exists and opts.errorIfExists is true');
      _this._data = JSON.parse((yield (0, _gzip.gunzip)((yield _this._seco.read()))));
    }
  }), cb);
};

SecoDOWN.prototype._close = function (cb) {
  var _this2 = this;

  callback(_asyncToGenerator(function* () {
    yield (0, _pWaitFor2.default)(function () {
      return _this2._writeQueue.size === 0 && _this2._writeQueue.pending === 0;
    });
    _this2._seco.destroy();
  }), cb);
};

// Internal Function
SecoDOWN.prototype._write = _asyncToGenerator(function* () {
  var _this3 = this;

  yield this._writeQueue.add(_asyncToGenerator(function* () {
    return yield _this3._seco.write((yield (0, _gzip.gzip)(JSON.stringify(_this3._data))));
  }));
});

SecoDOWN.prototype._put = function (key, val, opts, cb) {
  var _this4 = this;

  callback(_asyncToGenerator(function* () {
    if (typeof val === 'undefined' || val === null) val = '';
    _this4._data[key] = val;
    yield _this4._write();
  }), cb);
};

SecoDOWN.prototype._get = function (key, opts, cb) {
  var _this5 = this;

  callback(_asyncToGenerator(function* () {
    let val = _this5._data[key];
    if (typeof val === 'undefined') throw new Error('NotFound');
    if (opts.asBuffer !== false && !Buffer.isBuffer(val)) val = new Buffer(String(val));
    return val;
  }), cb);
};

SecoDOWN.prototype._del = function (key, opts, cb) {
  var _this6 = this;

  callback(_asyncToGenerator(function* () {
    delete _this6._data[key];
    yield _this6._write();
  }), cb);
};

SecoDOWN.prototype._batch = function (operations, opts, cb) {
  var _this7 = this;

  // Not sure if this is fully atomic
  // If there is a get call right after a batch call...
  callback(_asyncToGenerator(function* () {
    operations.forEach(function (op) {
      if (op.type === 'put') {
        if (typeof op.value === 'undefined' || op.value === null) op.value = '';
        _this7._data[op.key] = op.value;
      } else if (op.type === 'del') {
        delete _this7._data[op.key];
      } else throw new Error(`Invalid type ${op.type}`);
    });
    yield _this7._write();
  }), cb);
};

// our new prototype inherits from AbstractLevelDOWN
(0, _util.inherits)(SecoDOWN, _abstractLeveldown.AbstractLevelDOWN);

module.exports = SecoDOWN;

function callback(fn, cb) {
  fn().then(r => cb(null, r)).catch(cb);
}