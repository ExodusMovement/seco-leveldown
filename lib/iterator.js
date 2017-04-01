'use strict';

require('object.entries/shim');

var _util = require('util');

var _abstractLeveldown = require('abstract-leveldown');

var _ltgt = require('ltgt');

var ltgt = _interopRequireWildcard(_ltgt);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function SecoIterator(db, opts) {
  _abstractLeveldown.AbstractIterator.call(this, db)
  // ltgt coughs when limits are null, so convert null -> undefined
  ;['lt', 'gt', 'lte', 'gte', 'start', 'end'].forEach(k => {
    if (opts[k] === null) delete opts[k];
  });
  this._opts = opts;
  // Need to use Object.entries for snapshot support:
  this._data = Object.entries(db._data).sort((a, b) => ltgt.compare(a[0], b[0])).filter((e, i) => ltgt.filter(opts)(e[0], i[0]));
  if (opts.reverse) this._data.reverse();
  this._i = -1;
}

SecoIterator.prototype._next = function (cb) {
  this._i++;
  if (this._i >= this._data.length || this._i === this._opts.limit) return process.nextTick(() => cb());
  let key = this._data[this._i][0];
  let val = String(this._data[this._i][1]);
  if (this._opts.keyAsBuffer !== false && !Buffer.isBuffer(key)) key = new Buffer(key);
  if (this._opts.valueAsBuffer !== false && !Buffer.isBuffer(val)) val = new Buffer(val);
  process.nextTick(() => cb(undefined, key, val));
};

(0, _util.inherits)(SecoIterator, _abstractLeveldown.AbstractIterator);

module.exports = SecoIterator;