import test from 'tape'
import SecoDOWN from '../src'

test('respects opts.createIfMissing: false', t => {
  const secoDown = new SecoDOWN('abc')
  secoDown.open({ createIfMissing: false }, (err, db) => {
    t.assert(err)
    t.end()
  })
})
