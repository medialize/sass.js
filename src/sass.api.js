/*global Module, FS, PATH, stripLeadingSlash, addTrailingSlash, XMLHttpRequest, noop, options*/
/*jshint strict:false*/

var Sass = {
  style: {
    nested: 0,
    expanded: 1,
    compact: 2,
    compressed: 3,
  },
  comments: {
    'none': 0,
    'default': 1,
  },

  _options: {
    // filled by sass.options.js
  },
  _defaultOptions: {
    // filled by sass.options.js
  },
  _optionTypes: {
    // filled by sass.options.js
  },

  _files: {},
  _path: '/sass/',

  FS: FS,
  PATH: PATH,
  Module: Module,

  // track if emscripten is initialized
  _initialized: false,
  // allow calling .compile() before emscripten is ready by "buffering" the call
  // (i.e. have the client not care about its asynchronous init)
  _ready: function() {
    Sass._initialized = true;
    // we may have buffered compile() calls during execution,
    Sass._compileNext();
  },

  _compileNext: function() {
    if (!Sass._compileQueue.length) {
      return;
    }
    // first in first out
    var args = Sass._compileQueue.shift();
    Sass.compile.apply(Sass, args);
  },

  options: function(options, callback) {
    if (options === 'defaults') {
      Sass.options(Sass._defaultOptions, callback);
      return;
    }

    if (typeof options !== 'object') {
      return;
    }

    Object.keys(options).forEach(function(key) {
      var _type = Sass._optionTypes[key];

      if (key === 'importer') {
        // allow passing compile() time options
        // to the importer callback
        Sass._options[key] = options[key];
        return;
      }

      // no need to import crap
      if (!_type) {
        throw new Error('Unknown option "' + key + '"');
      }

      // force expected data type
      Sass._options[key] = _type(options[key]);
    });

    callback && callback();
  },

  _cloneOptions: function() {
    var o = {};
    Object.keys(Sass._options).forEach(function(key) {
      o[key] = Sass._options[key];
    });

    return o;
  },

  importer: function(importerCallback, callback) {
    if (typeof importerCallback !== 'function' && importerCallback !== null) {
      throw new Error('importer callback must either be a function or null');
    }

    Sass._importer = importerCallback;
    callback && callback();
  },

  _absolutePath: function(filename) {
    return Sass._path + stripLeadingSlash(filename);
  },

  _createPath: function(parts) {
    var base = [];

    while (parts.length) {
      var directory = parts.shift();
      try {
        FS.createFolder(base.join('/'), directory, true, true);
      } catch(e) {
        // IGNORE file exists errors
      }

      base.push(directory);
    }
  },

  _ensurePath: function(filename) {
    var parts = filename.split('/');
    parts.pop();

    if (!parts.length) {
      return;
    }

    try {
      FS.stat(parts.join('/'));
      return;
    } catch(e) {
      Sass._createPath(parts);
    }
  },

  writeFile: function(filename, text, callback) {
    if (typeof filename === 'object') {
      callback = text;
      text = null;

      var map = {};
      Object.keys(filename).forEach(function(file) {
        Sass.writeFile(file, filename[file], function(result) {
          map[file] = result;
        });
      });

      callback && callback(map);
      return;
    }

    var _absolute = filename.slice(0, 1) === '/';
    var path = Sass._absolutePath(filename);
    try {
      Sass._ensurePath(path);
      FS.writeFile(path, text);
      Sass._files[path] = filename;
      // create symlink for absolute path resolution
      if (_absolute) {
        Sass._ensurePath(filename);
        FS.symlink(path, filename);
      }
      callback && callback(true);
    } catch(e) {
      callback && callback(false);
    }
  },

  readFile: function(filename, callback) {
    if (Array.isArray(filename)) {
      var map = {};
      filename.forEach(function(file) {
        Sass.readFile(file, function(result) {
          map[file] = result;
        });
      });

      callback && callback(map);
      return;
    }

    var path = Sass._absolutePath(filename);
    var result;
    try {
      result = FS.readFile(path, {encoding: 'utf8'});
    } catch(e) {}

    callback && callback(result);
  },

  listFiles: function(callback) {
    var list = Object.keys(Sass._files).map(function(path) {
      return Sass._files[path];
    });

    callback && callback(list);
  },

  removeFile: function(filename, callback) {
    if (Array.isArray(filename)) {
      var map = {};
      filename.forEach(function(file) {
        Sass.removeFile(file, function(result) {
          map[file] = result;
        });
      });

      callback && callback(map);
      return;
    }

    var _absolute = filename.slice(0, 1) === '/';
    var path = Sass._absolutePath(filename);
    try {
      FS.unlink(path);
      delete Sass._files[path];

      // undo symlink for absolute path resolution
      if (_absolute && FS.lstat(filename)) {
        FS.unlink(filename);
      }

      callback && callback(true);
    } catch(e) {
      callback && callback(false);
    }
  },

  clearFiles: function(callback) {
    Sass.listFiles(function(list) {
      list.forEach(function(file) {
        Sass.removeFile(file);
      });

      callback && callback();
    });
  },

  _handleFiles: function(base, directory, files, callback) {
    var _root = Sass._absolutePath(directory || '');
    _root = addTrailingSlash(_root);
    base = addTrailingSlash(base);

    return files.map(function(file) {
      file = stripLeadingSlash(file);

      var parts = file.split('/');
      var _file = parts.pop();
      var _path = _root + parts.join('/');
      _path = addTrailingSlash(_path);

      return callback(_path, _file, base + file);
    }, Sass);
  },

  _handleLazyFile: function(path, file, url) {
    Sass._ensurePath(path + file);
    FS.createLazyFile(path, file, url, true, false);
  },

  _preloadingFiles: 0,
  _preloadingFilesCallback: null,
  _handlePreloadFile: function(path, file, url) {
    Sass._ensurePath(path + file);

    Sass._preloadingFiles++;
    var request = new XMLHttpRequest();
    request.onload = function() {
      Sass.writeFile(path.slice(Sass._path.length) + file, this.responseText);

      Sass._preloadingFiles--;
      if (!Sass._preloadingFiles) {
        Sass._preloadingFilesCallback();
        Sass._preloadingFilesCallback = null;
      }
    };

    request.open('get', url, true);
    request.send();
  },

  lazyFiles: function(base, directory, files, callback) {
    Sass._handleFiles(base, directory, files, Sass._handleLazyFile);
    callback && callback();
  },

  preloadFiles: function(base, directory, files, callback) {
    Sass._preloadingFilesCallback = callback || noop;
    Sass._handleFiles(base, directory, files, Sass._handlePreloadFile);
  },


  // allow concurrent task registration, even though we can only execute them in sequence
  _compileQueue: [],
  compile: function(text, _options, callback, _compileFile) {
    if (typeof _options === 'function') {
      callback = _options;
      _options = null;
    }

    if (!callback) {
      throw new Error('Sass.compile() requires callback function as second (or third) parameter!');
    }

    if (_options !== null && typeof _options !== 'object') {
      throw new Error('Sass.compile() requires second argument to be an object (options) or a function (callback)');
    }

    var done = function done(result) {
      var _cleanup = function() {
        // we're done, the next invocation may come
        Sass._sassCompileEmscriptenSuccess = null;
        Sass._sassCompileEmscriptenError = null;
        // we may have buffered compile() calls during execution,
        Sass._compileNext();
      };
      var _done = function() {
        // reset options to what they were before they got temporarily overwritten
        _previousOptions && Sass.options(_previousOptions);
        // make sure we cleanup regardless of what happenes in the callback
        (typeof setImmediate !== 'undefined' ? setImmediate : setTimeout)(_cleanup);
        // announce we're done while still buffering incoming compile() calls
        callback(result);
      };

      // give emscripten a chance to finish the C function and clean up
      // before we resume our JavaScript duties
      (typeof setImmediate !== 'undefined' ? setImmediate : setTimeout)(_done);
    };

    // only one Sass.compile() can run concurrently, wait for the currently running task to finish!
    // Also we need to delay .compile() to when emscripten is ready (if not already the case)
    // doing this *after* the initial sanity checks to maintain API behavior
    // in respect to when/how exceptions are thrown
    if (Sass._sassCompileEmscriptenSuccess || !Sass._initialized) {
      Sass._compileQueue.push([text, _options, callback, _compileFile]);
      return;
    }

    try {
      // temporarily - for the duration of this .compile() - overwrite options
      var _previousOptions = null;
      if (_options) {
        _previousOptions = Sass._cloneOptions();
        Sass.options(_options);
      }

      Sass._sassCompileEmscriptenSuccess = function(result, map, files) {
        done({
          status: 0,
          text: result,
          map: map,
          files: files,
        });
      };

      Sass._sassCompileEmscriptenError = function(error, message) {
        var result = error || {};
        result.formatted = message;
        done(result);
      };

      Module.ccall(
        // C function to call
        'sass_compile_emscripten',
        // return type
        null,
        // parameter types
        [
          'string',
          'string',
          'bool',
          'bool',
        ].concat(options.map(function(option) {
          return option.type;
        })),
        // arguments for invocation
        [
          text,
          Sass._path,
          Number(Boolean(_compileFile)),
          Number(Boolean(Sass._importer)),
        ].concat(options.map(function(option) {
          return Sass._options[option.key];
        })),
        // we're not expecting synchronous return value
        { async: true }
      );
    } catch(e) {
      done({
        status: 99,
        line: null,
        message: e.message,
        error: e
      });
    }
  },
  compileFile: function(filename, _options, callback) {
    var path = Sass._absolutePath(filename);
    if (typeof _options === 'function') {
      callback = _options;
      _options = {};
    }

    _options.sourceMapRoot = path;
    _options.inputPath = path;

    return Sass.compile(path, _options, callback, true);
  },
};

// register options maintained in sass.options.js
options.forEach(function(option) {
  Sass._options[option.key] = Sass._defaultOptions[option.key] = option.initial;
  Sass._optionTypes[option.key] = option.coerce;
});

// until 0.9.6 we used a weird hacky way to get informed by Module.onRuntimeInitialized
// when emscripten was fully loaded. But since 0.9.5 we're not using a separate .mem file
// anymore and emscripten doesn't preload any files for us, so this became irrelevant.

// initialize after emscripten is loaded and the event loop cleared
setTimeout(Sass._ready);
