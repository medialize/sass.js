/*global Sass, SASSJS_RELATIVE_PATH*/
var Module = {
  onRuntimeInitialized: function() {
    'use strict';
    // NodeJS resolves immediately, but the browser does not
    Module._sassFullyInitialized = true;
    setTimeout(function() {
      // initialize after emscripten is loaded
      Sass._ready();
    });
  },
};
