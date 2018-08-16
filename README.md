# npm-ensure

[![Build Status](https://travis-ci.org/yibn2008/npm-ensure.svg?branch=master)](https://travis-ci.org/yibn2008/npm-ensure)
[![Coverage Status](https://coveralls.io/repos/github/yibn2008/npm-ensure/badge.svg)](https://coveralls.io/github/yibn2008/npm-ensure)

ensure your package is good to commit/publish:

- ensure npm dependencies are complete
- ensure changelog exists

## Usage

You can use `npm-ensure` command under the package dir which you want to check.

```bash

  Usage: npm-ensure [options]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -t, --types <types>  ensure check types (e.g: deps,changelog)

```

Example:

```bash
$ cd path/to/some-package
$ npm-ensure -t deps
==> check dependencies
The following dependencies are not defined:

 - co
 - commander

total 2 packages

$ npm-ensure -t changelog
==> check changelog
changelog for current version is NOT exists

$ npm-ensure
==> check dependencies
The following dependencies are not defined:

 - co
 - commander

total 2 packages

==> check changelog
changelog for current version is NOT exists

```

Or you can add it as precommit/prepublish hook to check before commit/publish.

## Configration

use `ensure` field in package.json to config npm-ensure:

```json
{
  "name": "foobar",
  "version": "1.1.1",
  "scripts": {
    "precommit": "npm-ensure -t deps,changelog && npm test"
  },
  "ensure": {
    "deps": {
      "checkDirs": [
        "*.js",
        "src/**/*",
        "bin/**/*"
      ],
      "ignoreDirs": [
        "src/do-not-check/**/*"
      ],
      "ignores": [
        "babel-*"
      ]
    },
    "changelog": {
      "file": "HISTORY.md"
    }
  }
}
```

### Tips

- `deps.checkDirs`, specifies which dirs/files need to be checked for dependencies
- `deps.ignoreDirs`, specifies which dirs/files do NOT check
- `deps.ignores`, ignore these modules when check dependencies (support glob match syntax)
- `changelog.file`, specifies which file is CHANGELOG file

## Work with `lint-staged`

Only check git staged files with lint-staged:

```json
{
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "npm-ensure -t deps",
      "git add"
    ]
  }
}
```

## License

MIT
