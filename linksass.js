(function (Sass) {
    var sheetsLength = 0;

    var compileOnLoad = function () {
      //
      // Get all <link> tags with the 'rel' attribute set to "stylesheet/sass"
      //
      var links = document.getElementsByTagName('link'),
        head = document.getElementsByTagName('head')[0],
        linksLength = links.length,
        sheets = [], i, j;

      var ecb = function (status, url) {
        console.error('Error compiling sheet', 'Status:', status, 'Url:', url);
      };

      var cb = function (data) {
        var cpcss = Sass.compile(data);
        var css = document.createElement('style');

        if (typeof cpcss === 'object') {
          console.error(cpcss);
        } else {
          css.setAttribute('type', 'text/css');
          css.appendChild(document.createTextNode(cpcss));
          head.appendChild(css);

          sheetsLength--;
          if (sheetsLength > 0) {
            _doXHR(sheets.pop().href, cb, ecb);
          }
        }
      };

      if (linksLength) {
        for (i = 0; i < linksLength; i++) {
          if (links[i].rel === 'stylesheet/sass') {
            sheets.push(links[i]);
          }
        }

        sheetsLength = sheets.length;

        _doXHR(sheets.shift().href, cb, ecb);
      }
    };

    var _getXMLHttpRequest = function () {
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
    };

    var _doXHR = function (url, callback, errback) {
      var xhr = _getXMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.setRequestHeader('Accept', 'text/x-sass, text/css; q=0.9, */*; q=0.5');
      xhr.send(null);

      function handleResponse(xhr, callback, errback) {
        if (xhr.status >= 200 && xhr.status < 300) {
          Sass.writeFile(url.replace(window.location.origin + '/', ''), xhr.responseText);
          callback(xhr.responseText);
        } else {
          errback(xhr.status, url);
        }
      }

      handleResponse(xhr, callback, errback);
    };

    // compile sheets on the fly
    if (window && window.Sass) {
      compileOnLoad();
    }

})(window.Sass);    