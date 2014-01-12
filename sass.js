this.Sass = (function(){
  'use strict';

  var Sass = {
    style: {
      nested: 0,
      expanded: 1,
      compact: 2,
      compressed: 3
    },

    _createPath: function(parts) {
      var base = [''];

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
      try {
        Sass._ensurePath(filename);
        FS.writeFile(filename, text);
        return true;
      } catch(e) {
        return false;
      }
    },

    removeFile: function(filename) {
      try {
        FS.unlink(filename);
        return true;
      } catch(e) {
        return false;
      }
    },

    compile: function(text, style) {
      try {
        // in C we would use char *ptr; foo(&ptr) - in EMScripten this is not possible,
        // so we allocate a pointer to a pointer on the stack by hand
        var ptr_to_ptr = Module.allocate([0], 'i8', ALLOC_STACK);
        var result = Module.ccall('sass_compile_unrolled', 'string', ['string', 'number', 'i8'], [text, Number(style) || 0, ptr_to_ptr]);
        // this is equivalent to *ptr
        var err_str = Module.getValue(ptr_to_ptr, '*');
        // error string set? if not, it would be NULL and therefore 0
        if (err_str) {
          // pull string from pointer
          err_str = Module.Pointer_stringify(err_str);
          var error = err_str.match(/^source string:(\d+):/);
          var message = err_str.slice(error[0].length).replace(/(^\s+)|(\s+$)/g, '');
          // throw new Error(message, 'string', error[1]);
          return {
            line: Number(error[1]),
            message: message
          };
        }
      } catch(e) {
        // in case libsass.js was compiled without exception support
        return {
          line: null,
          message: 'Unknown Error: you need to compile libsass.js with exceptions to get proper error messages'
        };
      }

      return result;
    }
  };

  return Sass;
})();
