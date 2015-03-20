# Sass.js

Sass parser in JavaScript. This is a convenience API for emscripted [libsass](https://github.com/sass/libsass) (at v3.1.0). If you're looking to run Sass in node, you're probably looking for [node-sass](https://github.com/andrew/node-sass). Sass.js and node-sass should generate the same results.

> A fair warning: minified it's 2.2MB, gzipped it's 611KB. [node-sass](https://github.com/andrew/node-sass) is about 20 times faster than Sass.js

see the [live demo](http://medialize.github.com/sass.js/)


## Loading the Sass.js API

Sass.js comes in two flavors – the synchronous in-document `sass.js` and the asynchronous worker `sass.worker.js`. The primary API - wrapping the Emscripten runtime - is provided with `sass.js` (it is used internally by `sass.worker.js` as well). `sass.worker.js` mimics the same API (adding callbacks for the asynchronous part) and passes all the function calls through to the [web worker](https://developer.mozilla.org/en/docs/Web/API/Worker).

```html
<script src="dist/sass.worker.js"></script>
<script>
  // loading libsass.worker
  Sass.initialize('dist/worker.min.js');

  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  Sass.compile(scss, function(css) {
      console.log(css);
  });
</script>
```

It is possible - but *not recommended* to use sass.js without in the main RunLoop instead of using a Worker:

```html
<script src="dist/sass.min.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  var css = Sass.compile(scss);
  console.log(css);
</script>
```

You can - for debugging purposes - load `sass.js` from source files. Emscripten litters the global scope with ~400 variables, so this MUST never be used in production!

> Note: you need to have run `grunt build:libsass` before this is possible

```html
<script src="libsass/libsass/lib/libsass.js"></script>
<script src="src/sass.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  var css = Sass.compile(scss);
  console.log(css);
</script>
```

---


## Using the Sass.js API

```js
// compile text to SCSS
Sass.compile(text, function callback(result) {
  // (string) result is the compiled CSS
});

// set compile style options
Sass.options({
  // format output: nested, expanded, compact, compressed
  style: Sass.style.nested,
  // add line comments to output: none, default
  comments: Sass.comments.none
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
```

### Using the synchronous, non-worker API

```js
// compile text to SCSS
var result = Sass.compile(text);

// set compile style options
Sass.options({
  // format output: nested, expanded, compact, compressed
  style: Sass.style.nested,
  // add line comments to output: none, default
  comments: Sass.comments.none
});

// register a file to be available for @import
var success = Sass.writeFile(filename, text);

// remove a file
var success = Sass.removeFile(filename);

// get a file's content
var content = Sass.readFile(filename);

// list all files (regardless of directory structure)
var list = Sass.listFiles();
```

### Working With Files

Chances are you want to use one of the readily available Sass mixins (e.g. [drublic/sass-mixins](https://github.com/drublic/Sass-Mixins) or [Bourbon](https://github.com/thoughtbot/bourbon)). While Sass.js doesn't feature a full-blown "loadBurbon()", registering files is possible:

```js
Sass.writeFile('one.scss', '.one { width: 123px; }');
Sass.writeFile('some-dir/two.scss', '.two { width: 123px; }');
Sass.compile('@import "one"; @import "some-dir/two";', function(result) {
  console.log(result);
});
```

outputs

```css
.one {
  width: 123px; }

.two {
  width: 123px; }
```

---


## Building sass.js ##

```bash
grunt build
# destination:
#   dist/sass.js
#   dist/sass.min.js
#   dist/sass.worker.js
#   dist/worker.js
#   dist/worker.min.js
```

### Building libsass.js ###

```bash
# using grunt:
grunt build:libsass
# using bash:
(cd libsass && build-libsass.sh)

# destination:
#   libsass/libsass/lib/libsass.js
```

---


## Changelog

### master (libsass/3.2 integration) ###

this is the libsass version 3.2 integration branch

* [libsass 3.2 beta.1](https://github.com/sass/libsass/releases/tag/3.2.0-beta.1)
* [libsass 3.2 beta.2](https://github.com/sass/libsass/releases/tag/3.2.0-beta.2)
* compiling `master` because of [Fix deallocation of sources to use free instead of delete](https://github.com/sass/libsass/commit/ecf9ff475ea63e04a41c2ea38c52f40407dcd73a)
* adding various configuration options

open:

* support SourceMaps
* support sass syntax (the whitespace significant thing)
* figure out what these C plugins are and how we can make use of them (if at all)

### master ###

* adding `SassWorker._eval()` to execute arbitrary code in the worker context. This is used for development/debugging
* fixing the hiding of internal script errors

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


## License

Sass.js is - as [libsass](https://github.com/hcatlin/libsass) and [Emscripten](https://github.com/kripken/emscripten/) are - published under the [MIT License](http://opensource.org/licenses/mit-license).
