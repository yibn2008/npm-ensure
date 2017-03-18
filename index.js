'use strict'

const fs = require('fs')
const path = require('path')
const debug = require('debug')('npm-ensure')
const glob = require('glob')
const analyze = require('dependency-analyze')
const Minimatch = require('minimatch').Minimatch
const builtinModules = require('builtin-modules')

const DEFAULT_CHANGELOGS = [
  'changelog.md',
  'changelog',
  'history.md',
  'history'
]
const DEP_CHECK_EXTS = [
  '.js',
  '.jsx',
  '.es',
  '.scss',
  '.sass',
  '.css',
  '.less'
]

function parseModule (dep, strictMode, ignores) {
  if (dep.startsWith('.') || (strictMode && !dep.startsWith('~'))) {
    return false
  }

  if (dep.startsWith('~')) {
    dep = dep.substring(1)
  }

  // skip ignored modules
  if (ignores.find(mm => mm.match(dep))) {
    debug('ignore match %s, skip it', dep)
    return false
  }

  if (dep.startsWith('@')) {
    dep = dep.split('/', 2).join('/')
  } else {
    dep = dep.split('/', 1)[0]
  }

  return dep
}

function findFiles (baseDir, rules, ignore) {
  let matches = []

  for (let i = 0; i < rules.length; i++) {
    let rule = rules[i]

    debug('find files from %s: rule = %s', baseDir, rule)

    glob.sync(rule, {
      cwd: baseDir,
      ignore: [
        '.*',
        '/node_modules'
      ].concat(ignore),
      nodir: true,
      realpath: true
    }).forEach(file => {
      let extname = path.extname(file)

      // no ext, means maybe bin/* files
      if (!extname || DEP_CHECK_EXTS.indexOf(path.extname(file)) >= 0) {
        if (matches.indexOf(file) < 0) {
          matches.push(file)
        }
      }
    })

    debug('matched files: %s', matches)
  }

  return matches
}

function resolveFilesDeps (files, ignores) {
  let depModules = []

  files.forEach(file => {
    let extname = path.extname(file)
    let content = fs.readFileSync(file, 'utf8')
    let deps = []

    debug('resolve file %s', file)

    switch (extname) {
      case '':    // no extname, will treat as js file
      case '.js':
      case '.jsx':
      case '.es':
        deps = analyze.parseJS(content).map(dep => {
          return parseModule(dep, false, ignores)
        }).filter(m => m)
        break
      case '.scss':
      case '.sass':
      case '.css':
      case '.less':
        deps = analyze.parseCSS(content).map(dep => {
          return parseModule(dep, true, ignores)
        }).filter(m => m)
        break
    }

    debug('resolved deps: %s', deps)

    deps.forEach(dep => {
      if (depModules.indexOf(dep) < 0) {
        depModules.push(dep)
      }
    })
  })

  return depModules
}

/**
 * check dependencies
 * @param  {String} baseDir
 * @param  {Object} options
 *  - checkDirs: {String} check these dirs for dependencies
 *  - ignores: {Array} ignore these modules when check dependencies
 * @return {Array} missed dependencies
 */
function checkDeps (baseDir, options) {
  options = options || {}
  options.checkDirs = options.checkDirs || [ '*.js' ]
  options.ignoreDirs = options.ignoreDirs || []
  options.ignores = options.ignores || []

  debug('check deps: baseDir = %s, options = %j', baseDir, options)

  // minimatchs
  let ignores = []
  options.ignores.forEach(pattern => {
    ignores.push(new Minimatch(pattern))
  })

  // find deps
  let files = findFiles(baseDir, options.checkDirs, options.ignoreDirs)
  let depModules = resolveFilesDeps(files, ignores)

  // check dependencies
  let pkg = require(path.join(baseDir, 'package.json'))
  let dependencies = pkg.dependencies || {}
  let missing = []

  depModules.forEach(dep => {
    // skip builtin-modules
    if (builtinModules.indexOf(dep) >= 0) {
      return
    }

    if (!(dep in dependencies)) {
      missing.push(dep)
    }
  })

  return missing
}

function checkChangelog (baseDir, options) {
  options = options || {}

  let changelog

  if (!options.file) {
    let files = fs.readdirSync(baseDir)

    changelog = files.find(file => {
      return DEFAULT_CHANGELOGS.indexOf(file.toLowerCase()) >= 0
    })

    debug('resolved changelog: %s', changelog)
  } else {
    changelog = options.file
  }

  if (!changelog) {
    throw new Error('changelog file not exists')
  } else {
    changelog = path.join(baseDir, changelog)
  }

  let pkg = require(path.join(baseDir, 'package.json'))
  let content = fs.readFileSync(changelog, 'utf8')

  return content.indexOf(pkg.version) >= 0
}

module.exports = {
  checkDeps,
  checkChangelog
}
