# Building Sass.js

To compile libsass to JS you need [emscripten](http://emscripten.org), to build Sass.js you also need [grunt](http://gruntjs.com/).


## Preparations

Clone and initialize the repository

```bash
clone git@github.com:medialize/sass.js.git
cd sass.js
npm install
```

Install emscripten (using [Home Brew](http://brew.sh/))

```bash
brew install emscripten
```


## Building everything

```bash
grunt build

# destination:
#   dist/file-size.json
#   dist/sass.js
#   dist/sass.node.js
#   dist/sass.sync.js
#   dist/sass.worker.js
#   dist/versions.json
```

### Assembling files

When working with the Sass.js APIs it is not neccessary to download the libsass repository every time. The `grunt rebuild` command will compile the Sass.js the same way `grunt build` will, except it will expect the repository to already exist.

### Building in emscripten debug mode

This is useful (and necessary) to identify the callstacks required to whitelist for the [Emterpreter](https://github.com/kripken/emscripten/wiki/Emterpreter#emterpreter-async-run-synchronous-code).

```bash
grunt build:debug

# destination:
#   dist/file-size.json
#   dist/sass.js
#   dist/sass.node.js
#   dist/sass.sync.js
#   dist/sass.worker.js
#   dist/versions.json
```

### Building only libsass.js

When working on the C wrapper it may be unnecessary to build the entire library, but focus only on emscripting libsass instead.

```bash
# import libsass repository
grunt libsass:prepare
# invoke emscripten
grunt libsass:build
# invoke emscripten in debug mode
grunt libsass:debug

# destination:
#   libsass/libsass/lib/libsass.js
```


## Loading the source files in the browser

After cloning this repository you can run `grunt libsass:prepare libsass:build` and then run Sass.js off its source files to gain access to all components (emscripten environment, Sass.js components) in the global scope (see [`sass.source.html`](../sass.source.html)):

```html
<!-- you need to compile libsass.js first using `grunt libsass:prepare libsass:build` -->
<script src="libsass/libsass/lib/libsass.js"></script>
<!-- the Sass.js helpers to work with emscripten -->
<script src="src/sass.util.js"></script>
<!-- mapping of Sass.js options to be fed to libsass via the emscripten wrapper -->
<script src="src/sass.options.js"></script>
<!-- the Importer Callback infrastructure -->
<script src="src/sass.importer.js"></script>
<!-- the Sass.js abstraction of libsass and emscripten -->
<script src="src/sass.api.js"></script>
<!-- the libsass method of resolving paths from @import statements -->
<script src="src/sass.resolve-paths.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  Sass.compile(scss, function(result) {
    console.log(result);
  });
</script>
```

---

* [Readme](../README.md)
* [Getting started](./getting-started.md)
* [API documentation](./api.md)
* [Building Sass.js](./build.md)
* [Changelog](../CHANGELOG.md)
