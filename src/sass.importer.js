/*global Module, FS, PATH*/

var Importer = {
  _running: false,

  find: function(current, previous) {
    Importer._running = true;
    // TODO: implement file loading
    console.log("import()", current, previous);
    Importer._running = false;
  },

  finished: function() {
    return !Importer._running;
  },

  path: function() {
    // stringToPointer("hello world");
    return 0;
  },

  content: function() {
    return 0;
  },

  error: function() {
    return 0;
  },
};