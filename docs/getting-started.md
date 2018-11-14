# Getting started with Sass.js

Sass.js aims to run in all environments. To achieve that, it's provided in individual files for specific use cases:

* `dist/sass.js`: The consumable API for communicating with the worker `dist/sass.worker.js`.
* `dist/sass.worker.js`: The emscripted libsass loaded by `dist/sass.js` and the [Web Worker](https://developer.mozilla.org/en/docs/Web/API/Worker) utilities.
* `dist/sass.sync.js`: The consumable API and emscripted libsass for running the compiler in the main thread. Use this only in environments not supporting Web Workers (e.g. Node, Rhino, Nashorn).
* `dist/sass.node.js`: A convenience API around `dist/sass.sync.js` to compile directly from the file system.
* `dist/file-size.js`: *(meta)* A file listing the sizes of the compiled files.
* `dist/versions.js`: *(meta)* A file listing the versions of Sass.js, libsass and emscripten.


## Using Sass.js in the browser

The regular way of running Sass.js in the browser is by using the Web Worker (see  [`sass.worker.html`](../sass.worker.html)).

```html
<script src="dist/sass.js"></script>
<script>
  var sass = new Sass();
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  sass.compile(scss, function(result) {
    console.log(result);
  });
</script>
```

### Using Sass.js with a module loader

If you load `sass.js` by other means than then `<script>` example above, it cannot find the URL of `dist/sass.worker.js` by itself. In this case you need to tell Sass where to find the worker first:

```js
define(function defineSassModule(require) {
  // load Sass.js
  var Sass = require('path/to/sass.js');

  // tell Sass.js where it can find the worker,
  // url is relative to document.URL - i.e. outside of whatever
  // Require or Browserify et al do for you
  Sass.setWorkerUrl('path/to/dist/sass.worker.js');

  // initialize a Sass instance
  var sass = new Sass();

  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  sass.compile(scss, function(result) {
    console.log(result);
  });
});
```

### Using the Synchronous API in the browser

It is possible - but *not recommended* to use Sass.js in the main EventLoop by loading `dist/sass.sync.js` instead of using a Worker (see [`sass.sync.html`](../sass.sync.html)). Contrary to the worker API, the synchronous API does not allow concurrency, which is why it exposes a "singleton" instance:

```html
<script src="dist/sass.sync.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  Sass.compile(scss, function(result) {
    console.log(result);
  });
</script>
```

The synchronous API does not need to be told where to find the worker (using `Sass.setWorkerUrl()`) because everything is included in one file.


## Using Sass.js in Node (and Rhino, Nashorn, …)

While you probably want to use [node-sass](https://github.com/sass/node-sass) for performance reasons, Sass.js also runs on NodeJS. You can use the synchronous API (as in "executed in the main EventLoop") as follows:

```js
var Sass = require('sass.js');
var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
Sass.compile(scss, function(result) {
  console.log(result);
});
```

[webworker-threads](https://www.npmjs.com/package/webworker-threads) could be the key to running Sass.js in a non-blocking fashion in the future, but it (currently) has its problems with [typed arrays](https://github.com/audreyt/node-webworker-threads/issues/18#issuecomment-92098583).

### Accessing the file system in Node

In order to easily compile files in Node use the utility `dist/sass.node.js`. It takes care of reading files from the file system and importing them into emscripten's memory file system, so they're accessible to libsass.

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
