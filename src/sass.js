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

  // defined in sass_interface.h
  _options: {
    // Output style for the generated css code
    // using Sass.style.*
    style: 0,
    // Precision for outputting fractional numbers
    // 0: use libsass default
    precision: 0,
    // If you want inline source comments
    comments: 0,
    // Treat source_string as sass (as opposed to scss)
    indentedSyntax: 0,
    // embed include contents in maps
    sourceMapContents: 1,
    // embed sourceMappingUrl as data uri
    sourceMapEmbed: 1,
    // Disable sourceMappingUrl in css output
    sourceMapOmitUrl: 1,
    // Pass-through as sourceRoot property
    sourceMapRoot: 'root',
    // Path to source map file
    // Enables the source map generating
    // Used to create sourceMappingUrl
    sourceMapFile: 'file',
    // The input path is used for source map generation.
    // It can be used to define something with string
    // compilation or to overload the input file path.
    // It is set to "stdin" for data contexts
    // and to the input file on file contexts.
    inputPath: 'stdin',
    // The output path is used for source map generation.
    // Libsass will not write to this file, it is just
    // used to create information in source-maps etc.
    outputPath: 'stdout',
    // String to be used for indentation
    indent: '  ',
    // String to be used to for line feeds
    linefeed: '\n',
  },
  _optionTypes: {
    style: Number,
    precision: Number,
    comments: Boolean,
    indentedSyntax: Boolean,
    sourceMapContents: Boolean,
    sourceMapEmbed: Boolean,
    sourceMapOmitUrl: Boolean,
    sourceMapRoot: String,
    sourceMapFile: String,
    inputPath: String,
    outputPath: String,
    indent: String,
    linefeed: String,
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

      // in emscripten you pass booleans as integer 0 and 1
      if (_type === Boolean) {
        this._options[key] = Number(this._options[key]);
      }
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

      var args = [
        // char *source_string,
        ['string', text],
        // int output_style,
        ['number', Sass._options.style],
        // int precision,
        ['number', Sass._options.precision],
        // bool source_comments,
        ['number', Sass._options.comments],
        // bool is_indented_syntax_src,
        ['number', Sass._options.indentedSyntax],
        // bool source_map_contents,
        ['number', Sass._options.sourceMapContents],
        // bool source_map_embed,
        ['number', Sass._options.sourceMapEmbed],
        // bool omit_source_map_url,
        ['number', Sass._options.sourceMapOmitUrl],
        // char *source_map_root,
        ['string', Sass._options.sourceMapRoot],
        // char *source_map_file,
        ['string', Sass._options.sourceMapFile],
        // char *input_path,
        ['string', Sass._options.inputPath],
        // char *output_path,
        ['string', Sass._options.outputPath],
        // char *indent,
        ['string', Sass._options.indent],
        // char *linefeed,
        ['string', Sass._options.linefeed],
        // char *include_paths,
        ['string', Sass._path],
        // char **source_map_string,
        ['i8', mapPointer],
        // char **included_files,
        ['i8', filesPointer],
        // char **error_message
        ['i8', errorPointer],
      ];

      var result = Module.ccall(
        // C function to call
        'sass_compile_emscripten',
        // return type
        'string',
        // parameter types
        args.map(function(arg) {
          return arg[0];
        }),
        // arguments for invocation
        args.map(function(arg) {
          return arg[1];
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
