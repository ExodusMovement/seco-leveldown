import 'object.entries/shim'
import { inherits } from 'util'
import { AbstractIterator } from 'abstract-leveldown'
import * as ltgt from 'ltgt'

function SecoIterator (db, opts) {
  AbstractIterator.call(this, db)
  // ltgt coughs when limits are null, so convert null -> undefined
  ;['lt', 'gt', 'lte', 'gte', 'start', 'end'].forEach(k => {
    if (opts[k] === null) delete opts[k]
  })
  this._opts = opts
  // Need to use Object.entries for snapshot support:
  this._data = Object.entries(db._data)
                  .sort((a, b) => ltgt.compare(a[0], b[0]))
                  .filter((e, i) => ltgt.filter(opts)(e[0], i[0]))
  if (opts.reverse) this._data.reverse()
  this._i = -1
}

SecoIterator.prototype._next = function (cb) {
  this._i++
  if (this._i >= this._data.length || this._i === this._opts.limit) return process.nextTick(() => cb())
  let key = this._data[this._i][0]
  let val = String(this._data[this._i][1])
  if (this._opts.keyAsBuffer !== false && !Buffer.isBuffer(key)) key = new Buffer(key)
  if (this._opts.valueAsBuffer !== false && !Buffer.isBuffer(val)) val = new Buffer(val)
  process.nextTick(() => cb(undefined, key, val))
}

inherits(SecoIterator, AbstractIterator)

module.exports = SecoIterator
