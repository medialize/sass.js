# Sass.js

Sass parser in JavaScript. This is a convenience API for [emscripted](https://github.com/kripken/emscripten) [libsass](https://github.com/sass/libsass) (at v3.2.0). If you're looking to run Sass in node, you're probably looking for [node-sass](https://github.com/andrew/node-sass). Sass.js and node-sass should generate the same results.

> A fair warning: minified the worker weighs 2.6MB, gzipped it's still 700KB. If you're on NodeJS or io.js, please use the (considerably faster) [node-sass](https://github.com/andrew/node-sass) instead.

Have a go at the [playground](http://medialize.github.com/sass.js/playground.html) to fiddle with what sass.js has to offer.

## Loading the Sass.js API

Sass.js comes in two pieces: `sass.js` being the API available to the browser, `sass.worker.js` being the emscripted libsass that runs in a [Web Worker](https://developer.mozilla.org/en/docs/Web/API/Worker). For use in contexts where Web Workers are not available, `sass.sync.js` can be used for the synchronous API described below. The regular way of running sass.js is by way of [`sass.worker.html`](sass.worker.html):

```html
<script src="dist/sass.js"></script>
<script>
  // telling sass.js where it can find the worker,
  // url is relative to document.URL
  Sass.initialize('dist/sass.worker.js');

  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  Sass.compile(scss, function(result) {
    console.log(result);
  });
</script>
```

It is possible - but *not recommended* to use Sass.js without in the main RunLoop instead of using a Worker, by running [`sass.sync.html`](sass.sync.html):

```html
<script src="dist/sass.sync.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  var result = Sass.compile(scss);
  console.log(result);
</script>
```

In NodeJS you can use the synchronous API as follows:

```js
Sass = require('sass.js');
var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
var result = Sass.compile(scss);
console.log(result);
```

After cloning this repository you can run `grunt libsass:prepare libsass:build` (explained below) and then run sass.js off its source files by running [`sass.source.html`](sass.source.html)


> Note: you need to have run `grunt libsass:prepare libsass:build` before this is possible

```html
<!-- you need to compile libsass.js first using `grunt libsass:prepare libsass:build` -->
<script src="libsass/libsass/lib/libsass.js"></script>
<!-- mapping of Sass.js properties and options to be fed to libsass via the emscripten wrapper -->
<script src="src/sass.properties.js"></script>
<!-- the (synchronous) sass.js abstraction of libsass and emscripten -->
<script src="src/sass.api.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  var result = Sass.compile(scss);
  console.log(result);
</script>
```

---


## Using the Sass.js API

```js
// compile text to SCSS
Sass.compile(text, function callback(result) {
  // (object) result compilation result
  // (number) result.status success status (0 in success case)
  // (string) result.text compiled CSS string
  // (object) result.map SourceMap
  // (array)  result.files list of files used during compilation
  // -------------------------------
  // (number) result.status success status (not 0 in error case)
  // (string) result.file the file path the occurred in
  // (number) result.line the line the error occurred on
  // (number) result.column the character offset in that line the error began with
  // (string) result.message the error message
  // (string) result.formatted human readable error message containing all details
});

// set compile style options
Sass.options({
  // Format output: nested, expanded, compact, compressed
  style: Sass.style.nested,
  // Precision for outputting fractional numbers
  // (0 is libsass default precision)
  precision: 0,
  // If you want inline source comments
  comments: false,
  // Treat source_string as SASS (as opposed to SCSS)
  indentedSyntax: false,
  // String to be used for indentation
  indent: '  ',
  // String to be used to for line feeds
  linefeed: '\n',

  // Path to source map file
  // Enables the source map generating
  // Used to create sourceMappingUrl
  sourceMapFile: 'file',
  // Pass-through as sourceRoot property
  sourceMapRoot: 'root',
  // The input path is used for source map generation.
  // It can be used to define something with string
  // compilation or to overload the input file path.
  // It is set to "stdin" for data contexts
  // and to the input file on file contexts.
  inputPath: 'stdin',
  // The output path is used for source map generation.
  // Libsass will not write to this file, it is just
  // used to create information in source-maps etc.
  outputPath: 'stdout',
  // Embed included contents in maps
  sourceMapContents: true,
  // Embed sourceMappingUrl as data uri
  sourceMapEmbed: false,
  // Disable sourceMappingUrl in css output
  sourceMapOmitUrl: true,
}, function callback(){});

// register a file to be available for @import
Sass.writeFile(filename, text, function callback(success) {
  // (boolean) success is
  //   `true` when the write was OK,
  //   `false` when it failed
});

// remove a file
Sass.removeFile(filename, function callback(success) {
  // (boolean) success is
  //   `true` when deleting the file was OK,
  //   `false` when it failed
});

// get a file's content
Sass.readFile(filename, function callback(content) {
  // (string) content is the file's content,
  //   `undefined` when the read failed
});

// list all files (regardless of directory structure)
Sass.listFiles(function callback(list) {
  // (array) list contains the paths of all registered files
});

// remove all files
Sass.clearFiles(function callback() {});

// preload a set of files
// see chapter »Working With Files« below
Sass.preloadFiles(remoteUrlBase, localDirectory, filesMap, callback);

// register a set of files to be (synchronously) loaded when required
// see chapter »Working With Files« below
Sass.lazyFiles(remoteUrlBase, localDirectory, filesMap, callback);
```

### Using the synchronous API

the expected input and the produced output is the same as with the *preferred* worker API. Only the way how data is passed to and from sass.js differs:

```js
// compile text to SCSS
var result = Sass.compile(text);

// set compile style options
Sass.options({
  // see worker API for list of options
});

// register a file to be available for @import
var success = Sass.writeFile(filename, text);

// remove a file
var success = Sass.removeFile(filename);

// get a file's content
var content = Sass.readFile(filename);

// list all files (regardless of directory structure)
var list = Sass.listFiles();

// remove all files
Sass.clearFiles();

// preload a set of files
// see chapter »Working With Files« below
Sass.preloadFiles(remoteUrlBase, localDirectory, filesMap, callback);
```

### `compile()` Response Object

Compiling the following source:

```scss
$someVar: 123px; .some-selector { width: $someVar; }
```

Yields the following `result` object:

```js
{
  // status 0 means everything is ok,
  // any other value means an error occured
  "status": 0,
  // the compiled CSS
  "text": ".some-selector {\n  width: 123px; }\n",
  // the SourceMap for this compilation
  "map": {
    "version": 3,
    "sourceRoot": "root",
    "file": "stdout",
    "sources": [
      "stdin"
    ],
    "sourcesContent": [
      "$someVar: 123px; .some-selector { width: $someVar; }"
    ],
    "mappings": "AAAiB,cAAc,CAAC;EAAE,KAAK,EAA7B,KAAK,GAAkB",
    "names": []
  },
  // the files that were used during the compilation
  "files": []
}
```

Compiling the following (invalid) source:

```scss
$foo: 123px;

.bar {
  width: $bar;
}

bad-token-test
```

Yields the following `result` object:

```js
{
  // status other than 0 means an error occured
  "status": 1,
  // the file the problem occurred in
  "file": "stdin",
  // the line the problem occurred on
  "line": 5,
  // the character on the line the problem started with
  "column": 2,
  // the problem description
  "message": "invalid top-level expression",
  // human readable formatting of the error
  "formatted": "Error: invalid top-level expression\n        on line 5 of stdin\n>> }\n   -^\n"
}
```

where the `formatted` properties contains a human readable presentation of the problem:

```
Error: invalid top-level expression
        on line 5 of stdin
>> }
   -^
```

### Working With Files

Chances are you want to use one of the readily available Sass mixins (e.g. [drublic/sass-mixins](https://github.com/drublic/Sass-Mixins) or [Bourbon](https://github.com/thoughtbot/bourbon)). While Sass.js doesn't feature a full-blown "loadBurbon()", registering individual files is possible:

```js
Sass.writeFile('one.scss', '.one { width: 123px; }');
Sass.writeFile('some-dir/two.scss', '.two { width: 123px; }');
Sass.compile('@import "one"; @import "some-dir/two";', function(result) {
  console.log(result.text);
});
```

outputs

```css
.one {
  width: 123px; }

.two {
  width: 123px; }
```

To make things somewhat more comfortable, Sass.js provides 2 methods to load batches of files. `Sass.lazyFiles()` registers the files and only loads them when they're loaded by libsass - the catch is this HTTP request has to be made synchronously (and thus only works within the WebWorker). `Sass.preloadFiles()` downloads the registered files immediately (asynchronously, also working in the synchronous API):

```js
// HTTP requests are made relative to worker
var base = '../scss/';
// equals 'http://medialize.github.io/sass.js/scss/'

// the directory files should be made available in
var directory = '';

// the files to load (relative to both base and directory)
var files = [
  'demo.scss',
  'example.scss',
  '_importable.scss',
  'deeper/_some.scss',
];

// register the files to load when necessary
Sass.lazyFiles(base, directory, files, function() { console.log('files registered, not loaded') });

// download the files immediately
Sass.preloadFiles(base, directory, files, function() { console.log('files loaded') });
```

Note that `Sass.lazyFiles()` can slow down the perceived performance of `Sass.compile()` because of the synchronous HTTP requests. They're made in sequence, not in parallel.

While Sass.js does not plan on providing file maps to SASS projects, it contains two mappings to serve as an example how your project can approach the problem: [`maps/bourbon.js`](maps/bourbon.js) and [`maps/drublic-sass-mixins.js`](maps/drublic-sass-mixins.js).

---


## Building Sass.js ##

You need [NodeJS](http://nodejs.org/), [grunt](http://gruntjs.com/) and of course [emscripten](http://kripken.github.io/emscripten-site/).

```bash
grunt build
# destination:
#   dist/sass.js
#   dist/sass.min.js
#   dist/sass.worker.js
#   dist/worker.js
#   dist/worker.min.js
```

### Building sass.js in emscripten debug mode ###

```bash
grunt build:debug
# destination:
#   dist/sass.js
#   dist/sass.min.js
#   dist/sass.worker.js
#   dist/worker.js
#   dist/worker.min.js
```

### Building only libsass.js ###

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

If you don't like grunt, run with the shell:

```bash
LIBSASS_VERSION="3.1.0"
# import libsass repository
(cd libsass && ./prepare.sh ${LIBSASS_VERSION})
# invoke emscripten
(cd libsass && ./build.sh ${LIBSASS_VERSION})
# invoke emscripten in debug mode
(cd libsass && ./build.sh ${LIBSASS_VERSION} debug)

# destination:
#   libsass/libsass/lib/libsass.js
```

---


## Changelog

### master (libsass/3.2 integration) ###

this is the libsass version 3.2 integration branch

* improving build infrastructure
  * allowing builds without forced download of libsass.git every time
  * providing emscripten debug mode
* Upgrading build infrastructure and API to libsass 3.2
  * [libsass 3.2 beta.4](https://github.com/sass/libsass/releases/tag/3.2.0-beta.4)
* improving `emscripten_wrapper.cpp` to use `sass_context.h` instead of the deprecated `sass_interface.h`
* improving error error reporting
* renaming files to make more sense
* adding `SassWorker._eval()` to execute arbitrary code in the worker context (for debugging emscripten JS API).
* adding `Sass.lazyFiles()` and `Sass.preloadFiles()`
* adding `Sass.clearFiles()` to wipe all files known to `Sass.listFiles()`
* adding configuration options
  * `precision` - Precision for outputting fractional numbers (`0` using libsass default)
  * `indentedSyntax` - Treat source string as SASS (as opposed to SCSS)
  * `indent` - String to be used for indentation (2 spaces)
  * `linefeed` - String to be used to for line feeds (`\n`)
  * `sourceMapRoot` - Pass-through as sourceRoot property
  * `sourceMapFile` - Path to source map file (enables generating source maps)
  * `sourceMapContents` - embed include contents in maps
  * `sourceMapEmbed` - embed sourceMappingUrl as data URI
  * `sourceMapOmitUrl` - Disable sourceMappingUrl in CSS output
  * `inputPath` - source map generation source (`stdin`)
  * `outputPath` - source map generation target

#### Breaking Changes

* `Sass.compile` used to return the compiled CSS as string, it now returns an object `{text: "generated_css"}`
* distribution files renamed or removed for clarity
  * `dist/worker.js` *removed*
  * `dist/sass.worker.js` *removed*
  * `dist/sass.min.js` *removed*
  * `dist/sass.worker.js` renamed to `dist/sass.js` (public API for the browser)
  * `dist/worker.min.js` renamed to `dist/sass.worker.js` (emscripted libsass for the web worker)
  * `dist/sass.js` renamed to `dist/sass.sync.js` (emscripted libsass synchronous API)
* source files renamed for clarity
  * `src/libsass.worker.js` renamed to `src/sass.worker.js` (contains the worker's `onmessage` handler)
  * `src/sass.js` renamed to `src/sass.api.js` (abstraction of libsass and emscription)
  * `src/sass.worker.js` renamed to `src/sass.js` (public API using `postMessage` to talk to worker internally)
* example files renamed for clarity
  * `sass.sync.html` *added*
  * `console.html` renamed to `sass.source.html`
  * `worker.html` renamed to `sass.worker.html`

### 0.6.3 (March 3rd 2015) ###

* fixing invalid source error handling ([#23](https://github.com/medialize/sass.js/issues/23))

### 0.6.2 (January 22nd 2015) ###

* fixing `Makefile.patch` for "memory file" to work with emscripten 1.29

### 0.6.1 (January 5th 2015) ###

* fixing `Makefile.patch` to work with libsass 3.1.0
* upgrading to [libsass 3.1.0](https://github.com/sass/libsass/releases/tag/3.1.0)

### 0.6.0 (December 23rd 2014) ###

* adding `grunt build:libsass` to make libsass.js ([#15](https://github.com/medialize/sass.js/issues/15))
* making absolute paths work via symlinks ([#19](https://github.com/medialize/sass.js/issues/19))

### 0.5.0 (August 31st 2014) ###

* upgrading to [libsass 2.1.0-beta](https://github.com/hcatlin/libsass/releases/tag/2.1.0-beta)

### 0.4.0 (June 6th 2014) ###

* upgrading to [libsass v2.0](https://github.com/hcatlin/libsass/releases/tag/v2.0) - Sending [#386](https://github.com/hcatlin/libsass/pull/386), [#387](https://github.com/hcatlin/libsass/pull/387), [#388](https://github.com/hcatlin/libsass/pull/388)

### 0.3.0 (April 5th 2014) ###

* upgrading to [libsass @1122ead...](https://github.com/hcatlin/libsass/commit/1122ead208a8d1c438daaca70041ef6dd2361fa0) (to be on par with [node-sass](https://github.com/andrew/node-sass) [v.0.8.3](https://github.com/andrew/node-sass/releases/tag/v0.8.3))

### 0.2.0 (January 16th 2014) ###

* using libsass at v1.0.1 (instead of building from master)
* adding `grunt build` to generate `dist` files
* adding mocha tests `grunt test`

### 0.1.0 (January 13th 2014) ###

* Initial Sass.js

## Authors

* [Christian Kruse](https://github.com/ckruse) - [@cjk101010](https://twitter.com/cjk101010)
* [Sebastian Golasch](https://github.com/asciidisco) - [@asciidisco](https://twitter.com/asciidisco)
* [Rodney Rehm](http://rodneyrehm.de/en/) - [@rodneyrehm](https://twitter.com/rodneyrehm)

## Credits

* the [sass group](https://github.com/sass), especially [team libsass](https://github.com/sass/libsass)
* team [emscripten](https://github.com/kripken/emscripten), especially [Alan Zakai](https://github.com/kripken)

## License

Sass.js is - as [libsass](https://github.com/sass/libsass) and [emscripten](https://github.com/kripken/emscripten/) are - published under the [MIT License](http://opensource.org/licenses/mit-license).
