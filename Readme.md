# Sass.js

Sass parser in JavaScript. This is a convenience API for [emscripted](https://github.com/kripken/emscripten) [libsass](https://github.com/sass/libsass) (at [v3.2.5](https://github.com/sass/libsass/releases/tag/3.2.5)). If you're looking to run Sass in node, you're probably looking for [node-sass](https://github.com/sass/node-sass). Sass.js and node-sass should generate the same results.

> A fair warning: minified the worker weighs 2.6MB, gzipped it's still 570KB (+20KB for the mem-file). If you're on NodeJS or io.js, please use the (considerably faster) [node-sass](https://github.com/andrew/node-sass) instead.

---

Have a look at the [Interactive Playground](http://medialize.github.io/playground.sass.js/)

## Loading the Sass.js API

Sass.js comes in two pieces: `sass.js` being the API available to the browser, `sass.worker.js` being the emscripted libsass that runs in a [Web Worker](https://developer.mozilla.org/en/docs/Web/API/Worker). For use in contexts where Web Workers are not available, `sass.sync.js` can be used for the synchronous API described below. The regular way of running Sass.js is by way of [`sass.worker.html`](sass.worker.html):

```html
<script src="dist/sass.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  sass.compile(scss, function(result) {
    console.log(result);
  });
</script>
```

If you load `sass.js` by other means than then `<script>` example above, it cannot find the URL of `dist/sass.worker.js` by itself. In this case you need to tell Sass where to find the worker first:

```js
define(function defineSassModule(require) {
  // load Sass.js
  var Sass = require('path/to/sass.js');

  // tell Sass.js where it can find the worker,
  // url is relative to document.URL - i.e. outside of whatever
  // Require or Browserify et al do for you
  Sass.setWorkerUrl('dist/sass.worker.js');

  // initialize a Sass instance
  var sass = new Sass();

  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  sass.compile(scss, function(result) {
    console.log(result);
  });
});
```

### Synchronous API (browser)

It is possible - but *not recommended* to use Sass.js in the main EventLoop instead of using a Worker, by running [`sass.sync.html`](sass.sync.html). Contrary to the worker API, the synchronous API does not allow concurrency, which is why it exposes a "singleton" instance:

```html
<!--
  Note that "libsass.js.mem" is loaded relative to document.URL,
  unless sass.sync.js is loaded in its own <script> element.
  That's ok for Node and Sass.js test pages, but probably not for production.
  Use the worker variant instead!
-->
<script src="dist/sass.sync.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  var result = Sass.compile(scss);
  Sass.compile(scss, function(result) {
    console.log(result);
  });
</script>
```

### Synchronous API (NodeJS)

While you probably want to use [node-sass](https://github.com/sass/node-sass) for performance reasons, Sass.js also runs on NodeJS. You can use the synchronous API (as in "executed in the main EventLoop") as follows:

```js
Sass = require('sass.js');
var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
Sass.compile(scss, function(result) {
  console.log(result);
});
```

[webworker-threads](https://www.npmjs.com/package/webworker-threads) could be the key to running Sass.js in a non-blocking fashion, but it (currently) has its problems with [typed arrays](https://github.com/audreyt/node-webworker-threads/issues/18#issuecomment-92098583).

### Synchronous API From Source (browser)

After cloning this repository you can run `grunt libsass:prepare libsass:build` (explained below) and then run Sass.js off its source files by running [`sass.source.html`](sass.source.html)

```html
<!-- you need to compile libsass.js first using `grunt libsass:prepare libsass:build` -->
<script src="libsass/libsass/lib/libsass.js"></script>
<!-- mapping of Sass.js options to be fed to libsass via the emscripten wrapper -->
<script src="src/sass.options.js"></script>
<!-- the Sass.js abstraction of libsass and emscripten -->
<script src="src/sass.api.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  Sass.compile(scss, function(result) {
    console.log(result);
  });
</script>
```

---


## Using the Sass.js API

```js
// initialize a Sass instance
// Note: this is not necessary in the synchronous API
var sass = new Sass('path/to/sass.worker.js');

// destruct/destroy/clean up a Sass instance
// Note: this is not necessary in the synchronous API
sass.destroy();

// globally set the URL where the the sass worker file is located
// so it does not have to be supplied to every constructor
Sass.setWorkerUrl('path/to/sass.worker.js');
var sass = new Sass();


// compile text to SCSS
sass.compile(text, function callback(result) {
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
// it is possible to set options for a specific compile() call,
// rather than "gobally" for all compile() calls.
// see Sass.options() for details
sass.compile(text, options, callback);

// compile file to SCSS
sass.compileFile(filename, callback);
sass.compileFile(filename, options, callback);


// set libsass compile options
// (provided options are merged onto previously set options)
sass.options({
  // Format output: nested, expanded, compact, compressed
  style: Sass.style.nested,
  // Precision for outputting fractional numbers
  // (-1 will use the libsass default, which currently is 5)
  precision: -1,
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
// reset options to Sass.js defaults (listed above)
sass.options('defaults', function callback(){});


// register a file to be available for @import
sass.writeFile(filename, text, function callback(success) {
  // (boolean) success is
  //   `true` when the write was OK,
  //   `false` when it failed
});
// register multiple files
sass.writeFile({
  'filename-1.scss': 'content-1',
  'filename-2.scss': 'content-2',
}, function callback(result) {
  // (object) result is
  //    result['filename-1.scss']: success
  //    result['filename-2.scss']: success
  // (boolean) success is
  //   `true` when the write was OK,
  //   `false` when it failed
});

// remove a file
sass.removeFile(filename, function callback(success) {
  // (boolean) success is
  //   `true` when deleting the file was OK,
  //   `false` when it failed
});
// remove multiple files
sass.removeFile([filename1, filename2], function callback(result) {
  // (object) result is
  //    result[filename1]: success
  //    result[filename2]: success
  // (boolean) success is
  //   `true` when deleting the file was OK,
  //   `false` when it failed
});

// get a file's content
sass.readFile(filename, function callback(content) {
  // (string) content is the file's content,
  //   `undefined` when the read failed
});
// read multiple files
sass.readFile([filename1, filename2], function callback(result) {
  // (object) result is
  //    result[filename1]: content
  //    result[filename2]: content
  // (string) content is the file's content,
  //   `undefined` when the read failed
});

// list all files (regardless of directory structure)
sass.listFiles(function callback(list) {
  // (array) list contains the paths of all registered files
});

// remove all files
sass.clearFiles(function callback() {});

// preload a set of files
// see chapter »Working With Files« below
sass.preloadFiles(remoteUrlBase, localDirectory, filesMap, function callback() {});

// register a set of files to be (synchronously) loaded when required
// see chapter »Working With Files« below
// Note: this method is not available in the synchronous API
sass.lazyFiles(remoteUrlBase, localDirectory, filesMap, function callback() {});

// intercept file loading requests from libsass
sass.importer(function(request, done) {
  // (object) request
  // (string) request.current path libsass wants to load (content of »@import "<path>";«)
  // (string) request.previous absolute path of previously imported file ("stdin" if first)
  // (string) request.resolved currentPath resolved against previousPath
  // (string) request.path absolute path in file system, null if not found
  // -------------------------------
  // (object) result
  // (string) result.path the absolute path to load from file system
  // (string) result.content the content to use instead of loading a file
  // (string) result.error the error message to print and abort the compilation

  // asynchronous callback
  done(result);
});
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
  "line": 7,
  // the character on the line the problem started with
  "column": 1,
  // the problem description
  "message": "invalid top-level expression",
  // human readable formatting of the error
  "formatted": "Error: invalid top-level expression\n        on line 7 of stdin\n>> bad-token-test\n   ^\n"
}
```

where the `formatted` properties contains a human readable presentation of the problem:

```
Error: invalid top-level expression
        on line 7 of stdin
>> bad-token-test
   ^
```

### Compiling Concurrently

Using the worker API, multiple Sass instances can be initialized to compile sources in *parallel*, rather than in *sequence*:

```
// compile sources in sequence (default behavior)
var sass = new Sass('path/to/sass.worker.js');
sass.compile(source1, callback1);
sass.compile(source2, callback2);

// compile sources in parallel
Sass.setWorkerUrl('path/to/sass.worker.js')
var sass1 = new Sass();
var sass2 = new Sass();
sass1.compile(source1, callback1);
sass2.compile(source2, callback2);
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


### Importer Callback Function

Since libsass 3.2 a callback allows us to hook into the compilation process. The callback allows us to intercept libsass' attempts to process `@import "<path>";` declarations. The request object contains the `<path>` to be imported in `request.current` and the fully qualified path of the file containing the `@import` statement in `request.previous`. For convenience `request.resolved` contains a relative resolution of `current` against `previous`. To allow importer callbacks to overwrite *everything*, but not have to deal with any of libsass' default file resolution `request.path` contains the file's path found in the file system (including the variations like `@import "foo";` resolving to `…/_foo.scss`).

```js
// register a custom importer callback
Sass.importer(function(request, done) {
  if (request.path) {
    // Sass.js already found a file,
    // we probably want to just load that
    done();
  } else if (request.current === 'content') {
    // provide a specific content
    // (e.g. downloaded on demand)
    done({
      content: '.some { content: "from anywhere"; }'
    })
  } else if (request.current === 'redirect') {
    // provide a specific content
    done({
      path: '/sass/to/some/other.scss'
    })
  } else if (request.current === 'error') {
    // provide content directly
    // note that there is no cache
    done({
      error: 'import failed because bacon.'
    })
  } else {
    // let libsass handle the import
    done();
  }
});
// unregister custom reporter callback
Sass.importer(null);
```


---


## Building Sass.js ##

To compile libsass to JS you need [emscripten](http://emscripten.org), to build Sass.js additionally need [grunt](http://gruntjs.com/).

```bash
grunt build
# destination:
#   dist/libsass.js.mem
#   dist/sass.js
#   dist/sass.min.js
#   dist/sass.worker.js
#   dist/versions.json
#   dist/worker.js
#   dist/worker.min.js

```

### Building Sass.js in emscripten debug mode ###

```bash
grunt build:debug
# destination:
#   dist/libsass.js.mem
#   dist/sass.js
#   dist/sass.min.js
#   dist/sass.worker.js
#   dist/versions.json
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
#   libsass/libsass/lib/libsass.js.mem
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
#   libsass/libsass/lib/libsass.js.mem
```

---


## Changelog

### 0.9.2 (June 14th 2015) ###

* upgrading to [libsass 3.2.5](https://github.com/sass/libsass/releases/tag/3.2.5)

### 0.9.1 (May 30th 2015) ###

* fixing automatic path detection (for loading `sass.worker.js` and `libsass.js.mem`), to make `sass.sync.js` load `libsass.mem.js` relative to itself (Node and browser) - ([Issue #33](https://github.com/medialize/sass.js/issues/33))

### 0.9.0 (May 21st 2015) ###

**NOTE:** This release contains breaking changes!

* upgrading to [libsass 3.2.4](https://github.com/sass/libsass/releases/tag/3.2.4)
* fixing worker API to avoid throwing `DataCloneError` because `postMessage` can't handle `Error` instances
* improving worker API to find `sass.worker.js` itself when loaded through simple `<script>` element - ([Issue #32](https://github.com/medialize/sass.js/issues/32))
* improving worker API to allow multiple *parallel* workers to be initialized - **Breaking Change**
* improving `Sass.compile()` to queue multiple invocations for serialized execution rather than throwing an error
* adding `sass.destroy()` to terminate a worker and free its resources
* adding `Sass.setWorkerUrl()` to define the path of the worker before a Sass instance is created


#### Breaking Changes

* The worker API used to be initialized with `Sass.initialize('path/to/sass.worker.js')`, but as of v0.9.0 requires proper instantiation: `var sass = new Sass('path/to/sass.worker.js')`.

### 0.8.2 (May 9th 2015) ###

* upgrading to [libsass 3.2.3](https://github.com/sass/libsass/releases/tag/3.2.3)
* fixing build to cope with `emcc --version` not naming a commit - ([Issue #30](https://github.com/medialize/sass.js/issues/30))
* fixing build to *not* minify distributables (very little gain, but breaks asm in Firefox) - ([Issue #29](https://github.com/medialize/sass.js/issues/29))
* fixing `.compile()` to wait until emscripten is ready - ([Issue #29](https://github.com/medialize/sass.js/issues/29))

### 0.8.1 (May 2nd 2015) ###

* upgrading to [libsass 3.2.2](https://github.com/sass/libsass/releases/tag/3.2.2)
* adding `Sass.compileFile()` to compile directly from file system
* fixing `Sass.options('defaults', callback)` to actually fire the callback
* improving `Sass.compile()` to accept options to temporarily set for that invocation, extending the signature to
  * `Sass.compile(source, callback)`
  * `Sass.compile(source, options, callback)`
* improving `Sass.writeFile()` to accept a map of files to write
* improving `Sass.readFile()` to accept an array of files to read
* improving `Sass.removeFile()` to accept an array of files to remove

### 0.8.0 (May 2nd 2015) ###

(failed and unpublished from npm, removed tag, see 0.8.1, I'm sorry)

### 0.7.2 (April 30th 2015) ###

* fixing option `precision` so that by default Sass.js won't overwrite libsass default precision (`5`)

### 0.7.1 (April 30th 2015) ###

* upgrading to [libsass 3.2.1](https://github.com/sass/libsass/releases/tag/3.2.1)

### 0.7.0 (April 27th 2015) ###

**NOTE:** This release contains several breaking changes!

* Upgrading build infrastructure
  * compile [libsass 3.2.0](https://github.com/sass/libsass/releases/tag/3.2.0)
  * allowing builds without forced download of libsass.git every time
  * providing emscripten debug mode
* improving `emscripten_wrapper.cpp` to use `sass_context.h` instead of the deprecated `sass_interface.h`
* renaming files to make more sense
* improving synchronous API to perfectly mirror the worker API
* adding `.options('defaults')` to reset options to Sass.js defaults
* adding `dist/libsass.js.mem`, optimized memory file created by emscripten
* adding `Sass.lazyFiles()` and `Sass.preloadFiles()`
* adding `Sass.clearFiles()` to wipe all files known to `Sass.listFiles()`
* adding `Sass.importer()` to intercept file loading requests from libsass
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

* synchronous API (formerly `dist/sass.js` and `dist/sass.min.js`) is now *required* to be loaded from a directory called `dist` relative to `document.URL` (irrelevant for use in Node!)
* synchronous API now has the *exact same* signature as the worker API, meaning responses are not returned, but passed to callback functions instead.
* `Sass.compile()` used to return the compiled CSS as string, it now [returns an object](https://github.com/medialize/sass.js#compile-response-object)
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
* team [emscripten](https://github.com/kripken/emscripten), especially [Alon Zakai](https://github.com/kripken)

## License

Sass.js is - as [libsass](https://github.com/sass/libsass) and [emscripten](https://github.com/kripken/emscripten/) are - published under the [MIT License](http://opensource.org/licenses/mit-license).
