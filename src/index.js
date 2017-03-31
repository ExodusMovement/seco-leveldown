import { inherits } from 'util'
import { AbstractLevelDOWN } from 'abstract-leveldown'
import createSecoRW from 'seco-rw'
import exists from 'path-exists'
import PQueue from 'p-queue'
import pWaitFor from 'p-wait-for'

// constructor, passes through the 'location' argument to the AbstractLevelDOWN constructor
function SecoDOWN (location) {
  if (!(this instanceof SecoDOWN)) return new SecoDOWN(location)
  this._writeQueue = new PQueue({ concurrency: 1 })
  AbstractLevelDOWN.call(this, location)
}

SecoDOWN.prototype._open = function (opts, cb) {
  callback(async () => {
    this._seco = createSecoRW(this.location, opts.passphrase || 'Hi', opts.header)
    if (!await exists(this.location)) {
      await this._seco.write('{}')
      this._data = {}
    } else this._data = JSON.parse(await this._seco.read())
  }, cb)
}

SecoDOWN.prototype._close = function (cb) {
  callback(async () => {
    await pWaitFor(() => this._writeQueue.size === 0 && this._writeQueue.pending === 0)
    this._seco.destroy()
  }, cb)
}

// Internal Function
SecoDOWN.prototype._write = async function () {
  await this._writeQueue.add(() => this._seco.write(JSON.stringify(this._data)))
}

SecoDOWN.prototype._put = function (key, val, opts, cb) {
  callback(async () => {
    if (typeof val === 'undefined' || val === null) val = ''
    this._data[key] = val
    await this._write()
  }, cb)
}

SecoDOWN.prototype._get = function (key, opts, cb) {
  callback(async () => {
    let val = this._data[key]
    if (typeof val === 'undefined') throw new Error('NotFound')
    if (opts.asBuffer !== false && !Buffer.isBuffer(val)) val = new Buffer(String(val))
    return val
  }, cb)
}

SecoDOWN.prototype._del = function (key, opts, cb) {
  callback(async () => {
    this._data[key] = undefined
    await this._write()
  }, cb)
}

// our new prototype inherits from AbstractLevelDOWN
inherits(SecoDOWN, AbstractLevelDOWN)

module.exports = SecoDOWN

function callback (fn, cb) {
  fn().then(r => cb(null, r)).catch(cb)
}
