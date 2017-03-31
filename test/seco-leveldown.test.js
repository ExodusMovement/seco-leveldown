import test from 'tape'
import testCommon from 'abstract-leveldown/testCommon'
import fs from 'fs'
import SecoDOWN from '../src'

test('respects opts.createIfMissing: false', t => {
  const secoDown = new SecoDOWN('abc')
  secoDown.open({ createIfMissing: false }, (err, db) => {
    t.assert(err)
    t.end()
  })
})

test('respects opts.errorIfExists: true', t => {
  const location = testCommon.location()
  fs.writeFileSync(location, '')
  const secoDown = new SecoDOWN(location)
  secoDown.open({ errorIfExists: true }, (err, db) => {
    t.assert(err)
    t.assert(err.message.includes('Database file exists'))
    t.end()
  })
})
