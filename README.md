# npm-ensure

ensure your package is good to commit/publish:

- ensure npm deps satisfied
- ensure changelog exists

## Usage

You can use `npm-ensure` command under the package dir which you want to check.

```bash
$ cd path/to/some-package
$ npm-ensure
==> check dependencies
✓ OK

==> check changelog
✓ OK
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
