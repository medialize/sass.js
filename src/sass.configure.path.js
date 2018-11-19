/*global document*/
// identify the path sass.js is located at in case we're loaded by a simple
// <script src="path/to/sass.js"></script>
// this path can be used to identify the location of
// * sass.worker.js from sass.js
// * libsass.js.mem from sass.sync.js
// see https://github.com/medialize/sass.js/pull/32#issuecomment-103142214
// see https://github.com/medialize/sass.js/issues/33
var SASSJS_RELATIVE_PATH = (function() {
  'use strict';

  // in Node things are rather simple
  var hasDir = typeof __dirname !== 'undefined';
  if (hasDir) {
    return __dirname;
  }

  // we can only run this test in the browser,
  // so make sure we actually have a DOM to work with.
  if (typeof document === 'undefined' || !document.getElementsByTagName) {
    return null;
  }

  // http://www.2ality.com/2014/05/current-script.html
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var path = currentScript && currentScript.src;
  if (!path) {
    return null;
  }

  // [worker] make sure we're not running in some concatenated thing
  if (path.slice(-8) === '/sass.js') {
    return path.slice(0, -8);
  }

  // [sync] make sure we're not running in some concatenated thing
  if (path.slice(-13) === '/sass.sync.js') {
    return path.slice(0, -13);
  }

  return null;
})() || '.';
