/*global Module, FS, ALLOC_STACK*/
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

  options: function(options, callback) {
    if (options === 'defaults') {
      this.options(this._defaultOptions);
      return;
    }

    if (typeof options !== 'object') {
      return;
    }

    Object.keys(options).forEach(function(key) {
      var _type = this._optionTypes[key];

      // no need to import crap
      if (!_type) {
        throw new Error('Unknown option "' + key + '"');
      }

      // force expected data type
      this._options[key] = _type(options[key]);
    }, this);

    callback && callback();
  },

  importer: function(importerCallback, callback) {
    if (typeof importerCallback !== 'function' && importerCallback !== null) {
      throw new Error('importer callback must either be a function or null');
    }

    this._importer = importerCallback;
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
    request.onload = function(response) {
      Sass.writeFile(path.slice(Sass._path.length) + file, this.responseText);

      Sass._preloadingFiles--;
      if (!Sass._preloadingFiles) {
        Sass._preloadingFilesCallback();
        Sass._preloadingFilesCallback = null;
      }
    };

    request.open("get", url, true);
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

  compile: function(text, callback) {
    if (!callback) {
      throw new Error('Sass.compile() requires callback function as second paramter!');
    }

    try {
      if (Sass._sassCompileEmscriptenSuccess) {
        throw new Error('only one Sass.compile() can run concurrently, wait for the currently running task to finish!');
      }

      function done(result) {
        // give emscripten a chance to finish the C function and clean up
        // before we resume our JavaScript duties
        (typeof setImmediate !== 'undefined' ? setImmediate : setTimeout)(function() {
          // we're done, the next invocation may come
          Sass._sassCompileEmscriptenSuccess = null;
          Sass._sassCompileEmscriptenError = null;
          callback(result);
        })
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
        ['string', 'string', 'bool'].concat(options.map(function(option) {
          return option.type;
        })),
        // arguments for invocation
        [text, Sass._path, Number(Boolean(this._importer))].concat(options.map(function(option) {
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
  }
};

// register options maintained in sass.options.js
options.forEach(function(option) {
  Sass._options[option.key] = Sass._defaultOptions[option.key] = option.initial;
  Sass._optionTypes[option.key] = option.coerce;
});
