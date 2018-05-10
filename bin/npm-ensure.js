#!/usr/bin/env node

'use strict'

const path = require('path')
const chalk = require('chalk')
const version = require('../package.json').version
const program = require('commander')
const checks = require('..')

program
  .version(version)
  .option('-t, --types <types>', 'ensure check types (e.g: deps,changelog)')
  .parse(process.argv)

const baseDir = program.basedir || process.cwd()

function check () {
  let pkg = require(path.join(baseDir, 'package.json'))
  let ensure = pkg.ensure || {}
  let types = (program.types || 'all').split(',')
  let isAll = types.indexOf('all') === 0
  let pass = true

  // check dependencies
  if (isAll || types.indexOf('deps') >= 0) {
    console.log(chalk.cyan('==>') + ' check dependencies')

    try {
      let missing = checks.checkDeps(baseDir, ensure.deps)

      if (missing.length) {
        console.log('The following dependencies are not defined:\n')
        missing.forEach(dep => {
          console.log(chalk.red(' - ' + dep))
        })
        console.log('\ntotal %s packages', missing.length)
        console.log('you can install them by:\n\n  %s', chalk.cyan(`npm install ${missing.join(' ')} --save`))

        // set pass flag
        pass = false
      } else {
        console.log(chalk.green('✓ OK'))
      }
    } catch (err) {
      console.error(chalk.red('check error: ' + err.stack))

      // set pass flag
      pass = false
    }

    console.log()
  }

  // check changelog
  if (isAll || types.indexOf('changelog') >= 0) {
    console.log(chalk.cyan('==>') + ' check changelog')

    try {
      if (checks.checkChangelog(baseDir, ensure.changelog)) {
        console.log(chalk.green('✓ OK'))
      } else {
        console.log(chalk.red('changelog for current version is NOT exists'))

        // set pass flag
        pass = false
      }
    } catch (err) {
      console.error(chalk.red('check error: ' + err.stack))

      // set pass flag
      pass = false
    }
  }

  return pass
}

if (!check()) {
  process.exit(1)
}
