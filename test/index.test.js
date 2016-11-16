'use strict'

const path = require('path')
const assert = require('assert-plus')
const checks = require('..')

const baseDir = path.join(__dirname, 'fixtures')

describe('test checks', function () {
  it('should check all deps', function () {
    let missing = checks.checkDeps(baseDir, {
      checkDirs: [
        'lib/*.js',
        'lib/*.css',
        'bin/*'
      ],
      'ignores': [
        'ignore-*',
        '*/*.json'
      ]
    })

    assert.deepEqual(missing, [
      'dep1',
      'dep2',
      'dep3',
      'dep4',
      'dep5',
      'dep6',
      'dep7',
      'dep8',
      'dep9',
      'dep10',
      'dep11',
      'dep12'
    ])
  })

  it('should check changelog', function () {
    assert.equal(checks.checkChangelog(baseDir), true)
  })
})
