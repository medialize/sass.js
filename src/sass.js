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
    return Sass._path + (filename.slice(0, 1) === '/' ? filename.slice(1) : filename);
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

  compile: function(text) {
    try {
      var errorPointer = this._makePointerPointer();
      var mapPointer = this._makePointerPointer();
      var filesPointer = this._makePointerPointer();

      var context = {
        sass: this,
        options: this._options,
        func: {
          text: text,
          errorPointer: errorPointer,
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

      var error = this._readPointerPointer(errorPointer);
      if (error) {
        // Sass.compile("$foo:123px; .m { width:$foo; }") yields
        // error === "stdin:1: unbound variable $foobar"
        var _error = error.match(/^stdin:(\d+):/);
        var message = _error && error.slice(_error[0].length).replace(/(^\s+)|(\s+$)/g, '') || error;
        return {
          line: _error && Number(_error[1]) || null,
          message: message
        };
      }

      var map = this._readPointerPointer(mapPointer);
      var files = this._readPointerPointer(filesPointer);

      return {
        text: result,
        map: map && JSON.parse(map),
        files: files
      };
    } catch(e) {
      return {
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
