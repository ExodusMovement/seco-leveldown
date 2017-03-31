// These tests are ported from https://github.com/Level/memdown/blob/master/test.js
import test from 'tape'
import testCommon from 'abstract-leveldown/testCommon'
import SecoDOWN from '../src'

test('put multiple times', function (t) {
  t.plan(5)

  const db = new SecoDOWN(testCommon.location())

  db.open(function (err) {
    t.error(err, 'opens correctly')
    db.put('key', 'val', function (err) {
      t.error(err, 'no error')
      db.put('key', 'val2', function (err) {
        t.error(err, 'no error')
        db.get('key', {asBuffer: false}, function (err, val) {
          t.error(err, 'no error')
          t.same(val, 'val2')
        })
      })
    })
  })
})

test('global store', function (t) {
  t.plan(7)

  const location = testCommon.location()

  const db = new SecoDOWN(location)
  db.open(function (err) {
    t.error(err, 'opens correctly')
    db.put('key', 'val', function (err) {
      t.error(err, 'no error')
      db.get('key', {asBuffer: false}, function (err, val) {
        t.error(err, 'no error')
        t.same(val, 'val')
        const db2 = new SecoDOWN(location)
        db2.open(function (err) {
          t.error(err, 'opens correctly')
          db2.get('key', { asBuffer: false }, function (err, val) {
            t.error(err, 'no error')
            t.same(val, 'val')
            t.end()
          })
        })
      })
    })
  })
})
