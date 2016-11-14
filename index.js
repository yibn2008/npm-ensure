'use strict'

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const debug = require('debug')('npm-ensure')
const glob = require('glob')
const Minimatch = require("minimatch").Minimatch
const builtinModules = require('builtin-modules')

const IMPORT_RULE = /import\s*([\w\{\}\[\],\s]+)?\s*(['"])([^'"]+)\2/g
const REQUIRE_RULE = /require(\.resolve)?\s*\(\s*(['"])([^'"]+)\2\s*\)/g
const AT_IMPORT_RULE = /@import\s+(['"])([^'"]+)\1/g

const DEFAULT_CHANGELOGS = [
  'changelog.md',
  'changelog',
  'history.md',
  'history',
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

function findComments (text) {
  let ranges = []
  let index = 0
  let ruleMap = {
    '//': '\n',
    '/*': '*/'
  }
  let startRule = /\/\/|\/\*/g
  let matches

  while (matches = startRule.exec(text)) {
    let endChars = ruleMap[matches[0]]
    let start = startRule.lastIndex - matches[0].length
    let end = text.indexOf(endChars, startRule.lastIndex)

    if (end < 0) {
      end = Infinity
    }

    ranges.push([ start, end ])

    startRule.lastIndex = end
  }

  return ranges
}

function parseModule (dep, strictMode) {
  if (dep.startsWith('.') || (strictMode && !dep.startsWith('~'))) {
    return false
  }

  if (dep.startsWith('~')) {
    dep = dep.substring(1)
  }

  if (dep.startsWith('@')) {
    dep = dep.split('/', 2).join('/')
  } else {
    dep = dep.split('/', 1)[0]
  }

  return dep
}

function inCommentRanges (index, ranges) {
  return ranges.find(r => {
    return index >= r[0] && index < r[1]
  })
}

function depResolve (content, rules, parseModule) {
  let commentRanges = findComments(content)
  let matches = []
  let depModules = []

  rules.forEach(rule => {
    rule.lastIndex = 0

    while (matches = (rule.exec(content))) {

      // skip comments
      if (inCommentRanges(rule.lastIndex, commentRanges)) {
        debug('skip comment for %s', matches[0])
        continue
      }

      let module = parseModule(matches)

      if (module && depModules.indexOf(module) < 0) {
        depModules.push(module)
      }
    }
  })

  return depModules
}

function findFiles (baseDir, rules) {
  let matches = []

  for (let i = 0; i < rules.length; i ++) {
    let rule = rules[i]

    debug('find files from %s: rule = %s', baseDir, rule)

    glob.sync(rule, {
      cwd: baseDir,
      ignore: [
        '.*',
        '/node_modules'
      ],
      realpath: true
    }).forEach(file => {
      if (DEP_CHECK_EXTS.indexOf(path.extname(file)) >= 0) {
        if (matches.indexOf(file) < 0) {
          matches.push(file)
        }
      }
    })

    debug('matched files: %s', matches)
  }

  return matches
}

function resolveFilesDeps (files) {
  let depModules = []

  files.forEach(file => {
    let extname = path.extname(file)
    let content = fs.readFileSync(file, 'utf8')
    let deps = []

    debug('resolve file %s', file)

    switch (extname) {
      case '.js':
      case '.jsx':
      case '.es':
        deps = depResolve(content, [ IMPORT_RULE, REQUIRE_RULE ], matches => {
          return parseModule(matches[3], false)
        })
        break
      case '.scss':
      case '.sass':
      case '.css':
      case '.less':
        deps = depResolve(content, [ AT_IMPORT_RULE ], matches => {
          return parseModule(matches[2], true)
        })
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
  options.ignores = options.ignores || []

  // minimatchs
  let ignores = []
  options.ignores.forEach(pattern => {
    ignores.push(new Minimatch(pattern))
  })

  // find deps
  let files = findFiles(baseDir, options.checkDirs)
  let depModules = resolveFilesDeps(files)

  // check dependencies
  let pkg = require(path.join(baseDir, 'package.json'))
  let dependencies = pkg.dependencies || {}
  let missing = []

  depModules.forEach(dep => {
    // skip builtin-modules
    if (builtinModules.indexOf(dep) >= 0) {
      return
    }

    // skip ignored modules
    if (ignores.find(mm => mm.match(dep))) {
      debug('ignore match %s, skip it', dep)
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
