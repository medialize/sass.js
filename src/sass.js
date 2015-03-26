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
  _optionTypes: {
    // filled by properties
  },

  _files: {},
  _path: '/sass/',

  FS: FS,
  Module: Module,

  options: function(options) {
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

  _makePointerPointer: function() {
    // in C we would use char *ptr; foo(&ptr) - in EMScripten this is not possible,
    // so we allocate a pointer to a pointer on the stack by hand
    // http://kripken.github.io/emscripten-site/docs/api_reference/advanced-apis.html#allocate
    // https://github.com/kripken/emscripten/blob/master/src/preamble.js#L545
    // https://github.com/kripken/emscripten/blob/master/src/preamble.js#L568
    return Module.allocate([0], 'i8', ALLOC_STACK);
  },

  _readPointerPointer: function(pointer) {
    // this is equivalent to *ptr
    var _pointer = Module.getValue(pointer, '*');
    /*jshint camelcase:false*/
    // is the string set? if not, it would be NULL and therefore 0
    return _pointer ? Module.Pointer_stringify(_pointer) : null;
    /*jshint camelcase:true*/
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

  compile: function(text) {
    try {
      var _stack = Module.Runtime.stackSave();
      var errorPointer = this._makePointerPointer();
      var jsonPointer = this._makePointerPointer();
      var mapPointer = this._makePointerPointer();
      var filesPointer = this._makePointerPointer();

      var context = {
        sass: this,
        options: this._options,
        func: {
          text: text,
          errorPointer: errorPointer,
          jsonPointer: jsonPointer,
          mapPointer: mapPointer,
          filesPointer: filesPointer,
        },
      };

      var result = Module.ccall(
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

      var message = this._readPointerPointer(errorPointer);
      var error = this._readPointerPointer(jsonPointer);
      var map = this._readPointerPointer(mapPointer);

      var files = [];
      var _listPointer = Module.getValue(filesPointer, '*');
      // TODO: are we limited to 32bit?
      for (var i=0; true; i+=4) {
        var _pointer = Module.getValue(_listPointer + i, '*');
        if (!_pointer) {
          break;
        }

        var _file = Module.Pointer_stringify(_pointer);
        _file && files.push(_file);
      }

      Module.Runtime.stackRestore(_stack);

      if (error) {
        var _error = JSON.parse(error);
        _error.formatted = message;
        return _error;
      }

      return {
        status: 0,
        text: result,
        map: map && JSON.parse(map),
        files: files
      };
    } catch(e) {
      return {
        status: 99,
        line: null,
        message: e.message,
        error: e
      };
    }
  }
};

// register options based on properties description
properties.forEach(function(property) {
  if (property.source !== 'options') {
    return;
  }

  Sass._options[property.key] = property.initial;
  Sass._optionTypes[property.key] = property.coerce;
});
