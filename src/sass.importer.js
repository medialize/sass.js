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
    var found = Importer._resolvePath(resolved);
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
    return Importer._result && Importer._result[key] && stringToPointer(Importer._result[key]) || 0;
  },

  _libsassPathVariations: function(path) {
    // [importer,include_path] this is where we would add the ability to
    // examine the include_path (if we ever use that in Sass.js)
    path = PATH.normalize(path);
    var directory = PATH.dirname(path);
    var basename = PATH.basename(path);
    var extensions = ['.scss', '.sass', '.css'];
    // basically what is done by resolve_and_load() in file.cpp
    // Resolution order for ambiguous imports:
    return [
      // (1) filename as given
      path,
      // (2) underscore + given
      PATH.resolve(directory, '_' + basename)
    ].concat(extensions.map(function(extension) {
      // (3) underscore + given + extension
      return PATH.resolve(directory, '_' + basename + extension);
    })).concat(extensions.map(function(extension) {
      // (4) given + extension
      return PATH.resolve(directory, basename + extension);
    }));
  },

  _resolvePath: function(path) {
    return Importer._libsassPathVariations(path).reduce(function(found, path) {
      if (found) {
        return found;
      }

      try {
        FS.stat(path);
        return path;
      } catch(e) {
        return null;
      }
    }, null);
  },

};