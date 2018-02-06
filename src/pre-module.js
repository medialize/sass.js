/*global Sass, SASSJS_RELATIVE_PATH*/
/*jshint strict:false*/

var Module = {
  locateFile: function(path) {
    // we expect the libsass.wasm to live next to sass.worker.js and sass.sync.js in the dist directory
    return SASSJS_RELATIVE_PATH + '/' + path;
  },
  onRuntimeInitialized: function() {
    setTimeout(Sass._ready);
  },
}
