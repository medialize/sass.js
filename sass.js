this.Sass = (function(){
  
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
      // TODO: see http://kapadia.github.io/emscripten/2013/09/13/emscripten-pointers-and-pointers.html
      // for an idea about accessing a the `char **error_message` parameter - until then, this hack "works"
      try {
        var result = Module.ccall('sass_compile_unrolled', 'string', ['string', 'number'], [text, Number(style) || 0]);
      } catch(e) {
        // in case libsass.js was compiled without exception support
        return {
          line: null,
          message: 'Unknown Error: you need to compile libsass.js with exceptions to get proper error messages'
        };
      }
      var error = result.match(/^source string:(\d+):/);
      if (error) {
        var message = result.slice(error[0].length);
        // throw new Error(message, 'string', error[1]);
        return {
          line: Number(error[1]),
          message: message
        };
      }
      
      return result;
    }

  };
  
  
  return Sass;
  
})();