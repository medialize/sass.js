/*global Sass*/
var Module = {
  onRuntimeInitialized: function() {
    'use strict';
    setTimeout(function() {
      // initialize after emscripten is loaded
      Sass._ready();
    });
  },
};
