/*global Sass, SASSJS_RELATIVE_PATH*/
// NOTE: this will load "./libsass.js.mem" relative to CWD,
// that's fine in Node, but catastrophic in the browser.
// That's fine, since sass.sync.js is NOT recommended
// to be used in the browser anyway.
var Module = {
  memoryInitializerPrefixURL: SASSJS_RELATIVE_PATH + '/',
  onRuntimeInitialized: function() {
    'use strict';
    // NodeJS resolves immediately, but the browser does not
    Module._sassFullyInitialized = true;
    typeof Sass !== 'undefined' && Sass._ready();
  }
};
