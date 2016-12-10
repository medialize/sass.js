# Using the Sass.js API

See [Getting started](./getting-started.md) for instructions how to load the library.

* [Lifecycle (Worker API)](#lifecycle-worker-api)
* [Libsass compile options](#libsass-compile-options)
* Compiling SCSS / SASS to CSS
  * [Compiling strings](#compiling-strings)
  * [Compiling files](#compiling-files)
  * [The response object](#the-response-object)
  * [Compiling concurrently (Worker API)](#compiling concurrently-worker-api)
* Working with files
  * [Writing files](#writing-files)
  * [Reading files](#reading-files)
  * [Removing files](#removing-files)
  * [Listing files](#listing-files)
  * [Preloading files](#preloading-files)
  * [Lazyloading files (DEPRECATED)](#lazyloading-files-deprecated)
  * [The Importer Callback](#the-importer-callback)
  * [Resolving file names](#resolving-file-names)
* [File system access in Node](#file-system-access-in-node)


## Lifecycle (Worker API)

When using `dist/sass.js` (and subsequently `dist/sass.worker.js`) Sass.js needs to be initialized:

```js
// initialize a Sass instance
var sass = new Sass('path/to/sass.worker.js');

// destruct/destroy/clean up a Sass instance
sass.destroy();
```

Instead of providing the path to `dist/sass.worker.js` on every instantiation, it can be defined once

```js
// globally set the URL where the the sass worker file is located
// so it does not have to be supplied to every constructor
Sass.setWorkerUrl('path/to/sass.worker.js');

var sass = new Sass();
```


## Libsass compile options

Options provided with the `Sass.options()` method are merged onto previously set options.

### Resetting to default options

```js
// reset options to Sass.js defaults (listed above)
sass.options('defaults', function callback() {
  // invoked without arguments when operation completed
});
```

### Output style options

```js
sass.options({
  // Format output: nested, expanded, compact, compressed
  style: Sass.style.nested,
  // Decimal point precision for outputting fractional numbers
  // (-1 will use the libsass default, which currently is 5)
  precision: -1,
  // If you want inline source comments
  comments: false,
  // String to be used for indentation
  indent: '  ',
  // String to be used to for line feeds
  linefeed: '\n',
}, function callback() {
  // invoked without arguments when operation completed
});
```

### SASS vs. SCSS

```js
sass.options({
  // Treat source_string as SASS (as opposed to SCSS)
  indentedSyntax: false,
}, function callback() {
  // invoked without arguments when operation completed
});
```

### SourceMap options

```js
sass.options({
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
}, function callback() {
  // invoked without arguments when operation completed
});
```

### Passing data to the importer callback

It is possible to pass runtime data to the Importer Callback. The option can transport any JSON-serializable data structure. Within the Importer Callback this data is made accessible on `request.options`.

```js
sass.options({
  importer: {},
}, function callback() {
  // invoked without arguments when operation completed
});
```


## Compiling SCSS / SASS to CSS

### Compiling strings

The `Sass.compile()` method compiles a SCSS source string (SASS) to CSS. See the [the response object](#the-response-object) below for details on the operation's resulting data structure.

**NOTE:** To compile SASS source strings the option `indentedSyntax` needs to be set to `true`.

```js
sass.compile(source, function callback(result) {
  // invoked with the response object as single argument when operation completed
});
```

It is possible to set options for a specific `Sass.compile()` call, rather than globally for all `Sass.compile()` calls. See [Sass.options()](#libsass-compile-options) for details:

```js
sass.compile(source, options, function callback(result) {
  // invoked with the response object as single argument when operation completed
});
```

### Compiling files

The `Sass.compileFile()` method compiles a file in emscripten's file system to CSS. See [Working with files](#working-with-files) for details on how to operate emscripten's file system. See the [The response object](#the-response-object) below for details on the operation's resulting data structure.

**NOTE:** Libsass will automatically switch between SCSS and SASS based on the file extension (`.scss` vs `.sass`).

```js
sass.compileFile(path, function callback(result) {
  // invoked with the response object as single argument when operation completed
});
```

It is possible to set options for a specific `Sass.compileFile()` call, rather than globally for all `Sass.compileFile()` calls. See [Sass.options()](#libsass-compile-options) for details:

```js
sass.compileFile(path, options, function callback(result) {
  // invoked with the response object as single argument when operation completed
});
```

### The response object

Compiling the following source:

```scss
$someVar: 123px; .some-selector { width: $someVar; }
```

Yields the following `result` object:

```js
{
  // status 0 means everything is ok,
  // any other value means an error occurred
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

Compiling the following *invalid* source:

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

### Compiling concurrently (Worker API)

Using the worker API, multiple Sass instances can be initialized to compile sources in *parallel*, rather than in *sequence*:

```js
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


## Working with files

Chances are you want to use one of the readily available Sass mixins (e.g. [drublic/sass-mixins](https://github.com/drublic/Sass-Mixins) or [Bourbon](https://github.com/thoughtbot/bourbon)). While Sass.js doesn't feature a full-blown "loadBurbon()", registering individual files is possible:

```js
Sass.writeFile('one.scss', '.one { width: 123px; }');
Sass.writeFile('some-dir/two.scss', '.two { width: 123px; }');
Sass.compile('@import "one"; @import "some-dir/two";', function(result) {
  console.log(result.text);
});
```

Emscripten emulates a file system in memory. This is the file system libsass will use to read files from when using `compileFile()` or when `@import` statements are encountered. This is *not* the file system on your computer or server.

Within emscripten's file system, all paths are rewritten to be found within `/sass/`.

### Writing files

```js
// register a file to be available for @import
sass.writeFile(path, source, function callback(success) {
  // (boolean) success is
  //   `true` when the write was OK,
  //   `false` when it failed
});

// register multiple files
sass.writeFile({
  'file-1.scss': 'source-1',
  'directory/file-2.scss': 'source-2',
}, function callback(result) {
  // (object) result is
  //    result['file-1.scss']: success
  //    result['directory/file-2.scss']: success
  // (boolean) success is
  //   `true` when the write was OK,
  //   `false` when it failed
});
```

### Reading files

```js
// get a file's content
sass.readFile(path, function callback(content) {
  // (string) content is the file's content,
  //   `undefined` when the read failed
});

// read multiple files
sass.readFile([
  path1,
  path2,
], function callback(result) {
  // (object) result is
  //    result[path1]: content
  //    result[path2]: content
  // (string) content is the file's content,
  //   `undefined` when the read failed
});
```

### Removing files

```js
// remove a file
sass.removeFile(path, function callback(success) {
  // (boolean) success is
  //   `true` when deleting the file was OK,
  //   `false` when it failed
});

// remove multiple files
sass.removeFile([
  path1,
  path2,
], function callback(result) {
  // (object) result is
  //    result[path1]: success
  //    result[path2]: success
  // (boolean) success is
  //   `true` when deleting the file was OK,
  //   `false` when it failed
});
```

Emscripten's file system can be cleanup easily:

```js
// remove all files
sass.clearFiles(function callback() {
  // invoked without arguments when operation completed
});
```

### Listing files

```js
// list all files (regardless of directory structure)
sass.listFiles(function callback(list) {
  // (array) list contains the paths of all registered files
});
```

### Preloading files

The method `Sass.preloadFiles()` downloads all the registered files immediately (asynchronously, also working in the synchronous API).

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

// preload a set of files
sass.preloadFiles(base, directory, files, function callback() {
  // invoked without arguments when operation completed
});
```

While Sass.js does not plan on providing file maps to SASS projects, it contains two mappings to serve as an example how your project can approach the problem: [`maps/bourbon.js`](maps/bourbon.js) and [`maps/drublic-sass-mixins.js`](maps/drublic-sass-mixins.js).

### Lazyloading files (DEPRECATED)

The method `Sass.lazyFiles()` registers the files and only loads them when they're loaded by libsass - the catch is this HTTP request has to be made synchronously (and thus only works within the WebWorker).

**NOTE:** that `Sass.lazyFiles()` can slow down the perceived performance of `Sass.compile()` because of the synchronous HTTP requests. They're made in sequence, not in parallel.

**NOTE:** This method is not available in the synchronous API.

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

// register a set of files to be (synchronously) loaded when required
sass.lazyFiles(base, directory, files, function callback() {
  // invoked without arguments when operation completed
});
```

### The Importer Callback

Since libsass 3.2 a callback allows us to hook into the compilation process. The callback allows us to intercept libsass' attempts to process `@import "<path>";` declarations. The request object contains the `<path>` to be imported in `request.current` and the fully qualified path of the file containing the `@import` statement in `request.previous`. For convenience `request.resolved` contains a relative resolution of `current` against `previous`. To allow importer callbacks to overwrite *everything*, but not have to deal with any of libsass' default file resolution `request.path` contains the file's path found in the file system (including the variations like `@import "foo";` resolving to `…/_foo.scss`).

Runtime data can be passed to the Importer Callback via the [`importer` option](passing-data-to-the-importer-callback), which is made accessible on `request.options`.

```js
// intercept file loading requests from libsass
sass.importer(function(request, done) {
  // (object) request
  // (string) request.current path libsass wants to load (content of »@import "<path>";«)
  // (string) request.previous absolute path of previously imported file ("stdin" if first)
  // (string) request.resolved currentPath resolved against previousPath
  // (string) request.path absolute path in file system, null if not found
  // (mixed)  request.options the value of options.importer
  // -------------------------------
  // (object) result
  // (string) result.path the absolute path to load from file system
  // (string) result.content the content to use instead of loading a file
  // (string) result.error the error message to print and abort the compilation

  // asynchronous callback
  done(result);
});
```

```js
// register a custom importer callback
sass.importer(function(request, done) {
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
sass.importer(null);
```

### Resolving file names

Sass allows you to specify `@import "hello/world";`, which will be resolved (by [file.cpp](https://github.com/sass/libsass/blob/3.3.6/src/file.cpp#L303-L336)) against the following paths in the file system:

```js
[
  // (1) filename as given
  "hello/world",
  // (2) underscore + given
  "hello/_world",
  // (3) underscore + given + extension
  "hello/_world.scss",
  "hello/_world.sass",
  "hello/_world.css",
  // (4) given + extension
  "hello/world.scss",
  "hello/world.sass",
  "hello/world.css"
]
```

**In the Synchronous API** (`sass.sync.js`) Sass.js provides the above list when running `Sass.getPathVariations('hello/world')`. To simplify finding the correct file in the filesystem, the following may be used:

```js
var fs = require('fs');
var Sass = require('sass.js');

var file = Sass.findPathVariation(fs.statSync, 'hello/world');
```


## File system access in Node

In order to compile files from the *real* file system in Node, the utility `dist/sass.node.js` provides a simple interface that hides reading files from the file system and writing them to emscripten's file system before they can be used by libsass:

**NOTE:** paths must be relative to (and descendants of) the current working directory (`process.cwd()`).

```js
var compile = require('sass.js/dist/sass.node');

var path = 'scss/example.scss';
var options = {
  style: compile.Sass.style.expanded,
};

compile(path, options, function(result) {
  console.log(result);
});
```

---

* [Readme](../README.md)
* [Getting started](./getting-started.md)
* [API documentation](./api.md)
* [Building Sass.js](./build.md)
* [Changelog](../CHANGELOG.md)
