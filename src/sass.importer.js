/*global FS, PATH, Sass, stringToPointer*/
/*jshint strict:false*/

var Importer = {
  _running: false,
  _result: null,

  find: function(current, previous) {
    if (!Sass._importer) {
      Importer._running = false;
      return;
    }

    Importer._running = true;
    Importer._result = null;

    var resolved = PATH.resolve(previous === 'stdin' ? Sass._path : PATH.dirname(previous), current);
    var found = Sass.findPathVariation(FS.stat, resolved);
    var done = function done(result) {
      Importer._result = result;
      Importer._running = false;
    };

    try {
      Sass._importer({
        current: current,
        previous: previous,
        resolved: resolved,
        path: found,
        options: Sass._options.importer || null,
      }, done);
    } catch(e) {
      // allow emscripten to resume libsass,
      // if only to have it stop gracefully
      done({ error: e.message });
      // but don't just swallow the JS error
      console.error(e.stack);
    }
  },

  finished: function() {
    return !Importer._running;
  },

  path: function() {
    return Importer._resultPointer('path');
  },

  content: function() {
    return Importer._resultPointer('content');
  },

  error: function() {
    return Importer._resultPointer('error');
  },

  _resultPointer: function(key) {
    return Importer._result && Importer._result[key] !== undefined && stringToPointer(Importer._result[key]) || 0;
  },

};