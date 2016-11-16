# npm-ensure

ensure your package is good to commit/publish:

- ensure npm deps satisfied
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

### Notice

1. `deps.checkDirs`, specifies which directories need to be checked for dependencies
2. `deps.ignores`, ignore these modules when check dependencies (support glob match syntax)
3. `changelog.file`, specifies which file is CHANGELOG file

## License

MIT
