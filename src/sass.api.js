/*global Module, FS, ALLOC_STACK*/
/*jshint strict:false*/

function noop(){}

function stripLeadingSlash(text) {
  return text.slice(0, 1) === '/' ? text.slice(1) : text;
}

function addLeadingSlash(text) {
  return text.slice(0, 1) !== '/' ? ('/' + text) : text;
}

function stripTrailingSlash(text) {
  return text.slice(-1) === '/' ? text.slice(0, -1) : text;
}

function addTrailingSlash(text) {
  return text.slice(-1) !== '/' ? (text + '/') : text;
}

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
    // filled by properties
  },
  _defaultOptions: {
    // filled by properties
  },
  _optionTypes: {
    // filled by properties
  },

  _files: {},
  _path: '/sass/',

  FS: FS,
  Module: Module,

  options: function(options) {
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

  writeFile: function(filename, text) {
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
      return true;
    } catch(e) {
      return false;
    }
  },

  readFile: function(filename) {
    var path = Sass._absolutePath(filename);
    try {
      return FS.readFile(path, {encoding: 'utf8'});
    } catch(e) {
      return undefined;
    }
  },

  listFiles: function() {
    return Object.keys(Sass._files).map(function(path) {
      return Sass._files[path];
    });
  },

  removeFile: function(filename) {
    var _absolute = filename.slice(0, 1) === '/';
    var path = Sass._absolutePath(filename);
    try {
      FS.unlink(path);
      delete Sass._files[path];

      // undo symlink for absolute path resolution
      if (_absolute && FS.lstat(filename)) {
        FS.unlink(filename);
      }

      return true;
    } catch(e) {
      return false;
    }
  },

  clearFiles: function() {
    Sass.listFiles().forEach(Sass.removeFile);
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

  lazyFiles: function(base, directory, files) {
    Sass._handleFiles(base, directory, files, Sass._handleLazyFile);
  },

  preloadFiles: function(base, directory, files, callback) {
    Sass._preloadingFilesCallback = callback || noop;
    Sass._handleFiles(base, directory, files, Sass._handlePreloadFile);
  },

  _readString: function(pointer) {
    return pointer && Module.Pointer_stringify(pointer) || null;
  },

  _readJson: function(pointer) {
    var test = pointer && Module.Pointer_stringify(pointer) || null;
    return test && JSON.parse(test) || null;
  },

  _readStringArray: function(pointer) {
    var list = [];
    if (!pointer) {
      return list;
    }

    // TODO: are we limited to 32bit?
    for (var i=0; true; i+=4) {
      var _pointer = Module.getValue(pointer + i, '*');
      if (!_pointer) {
        break;
      }

      var _item = Module.Pointer_stringify(_pointer);
      _item && list.push(_item);
    }

    return list;
  },

  compile: function(text, callback) {
    if (!callback) {
      throw new Error('Sass.compile() requires callback function as second paramter!');
    }

    try {
      if (Sass._sassCompileEmscriptenSuccess) {
        throw new Error('only one Sass.compile() can run concurrently, wait for the currently running task to finish!');
      }

      var context = {
        sass: this,
        options: this._options,
        func: {
          text: text,
        },
      };

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

      Sass._sassCompileEmscriptenSuccess = function(result, map, filesPointer) {
        done({
          status: 0,
          text: Sass._readString(result),
          map: Sass._readJson(map),
          files: Sass._readStringArray(filesPointer),
        });
      };

      Sass._sassCompileEmscriptenError = function(error, message) {
        var result = Sass._readJson(error) || {};
        result.formatted = Sass._readString(message);
        done(result);
      };

      Module.ccall(
        // C function to call
        'sass_compile_emscripten',
        // return type
        'string',
        // parameter types
        properties.map(function(property) {
          return property.type;
        }),
        // arguments for invocation
        properties.map(function(property) {
          return context[property.source][property.key];
        })
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

// register options based on properties description
properties.forEach(function(property) {
  if (property.source !== 'options') {
    return;
  }

  Sass._options[property.key] = Sass._defaultOptions[property.key] = property.initial;
  Sass._optionTypes[property.key] = property.coerce;
});
