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
    },

    compileOnLoad: function () {
      //
      // Get all <link> tags with the 'rel' attribute set to "stylesheet/sass"
      //
      var links = document.getElementsByTagName('link'),
        head = document.getElementsByTagName('head')[0],
        linksLength = links.length,
        that = this,
        sheetsLength = 0,
        sheets = [], i, j;

      var ecb = function (status, url) {
        console.error('Error compiling sheet', 'Status:', status, 'Url:', url);
      };

      var cb = function (data) {
        var cpcss = that.compile(data);
        var css = document.createElement('style');
        css.setAttribute('type', 'text/css');
        css.appendChild(document.createTextNode(cpcss));
        head.appendChild(css);
      };

      if (linksLength) {
        for (i = 0; i < linksLength; i++) {
          if (links[i].rel === 'stylesheet/sass') {
            sheets.push(links[i]);
          }
        }

        sheetsLength = sheets.length;

        for (j = 0; j < sheetsLength; j++) {
          this._doXHR(sheets[j].href, cb, ecb);
        }
      }
    },

    _getXMLHttpRequest: function () {
      if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
      } else {
        try {
          /*global ActiveXObject */
          return new ActiveXObject("MSXML2.XMLHTTP.3.0");
        } catch (e) {
          console.error('browser does not support AJAX.');
            return null;
        }
      }
    },

    _doXHR: function (url, callback, errback) {
      var xhr = this._getXMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.setRequestHeader('Accept', 'text/x-sass, text/css; q=0.9, */*; q=0.5');
      xhr.send(null);

      function handleResponse(xhr, callback, errback) {
        if (xhr.status >= 200 && xhr.status < 300) {
          callback(xhr.responseText);
        } else {
          errback(xhr.status, url);
        }
      }

      handleResponse(xhr, callback, errback);
    }

  };
  
  
  return Sass;
  
})();

// compile sheets on the fly
if (window && window.Sass) {
  window.Sass.compileOnLoad();
}