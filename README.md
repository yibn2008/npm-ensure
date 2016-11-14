# npm-ensure

ensure your package is good to commit/publish:

- ensure npm deps satisfied
- ensure changelog exists

## Usage

```
{
  "name": "foobar",
  "version": "1.1.1",
  "scripts": {
    "precommit": "ensure -t deps,changelog . && npm test"
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
