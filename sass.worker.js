this.Sass = (function(){
  'use strict';

  var Sass = {
    _worker: null,
    _callbacks: {},

    style: {
      nested: 0,
      expanded: 1,
      compact: 2,
      compressed: 3
    },

    writeFile: function(filename, text, callback) {
      var id = 'cb' + Date.now() + Math.random();
      Sass._callbacks[id] = callback;
  		Sass._worker.postMessage({
  		  command: 'writeFile',
  		  id: id,
  		  filename: filename,
  		  text: text
  		});
    },

    removeFile: function(filename, callback) {
      var id = 'cb' + Date.now() + Math.random();
      Sass._callbacks[id] = callback;
  		Sass._worker.postMessage({
  		  command: 'removeFile',
  		  id: id,
  		  filename: filename
  		});
    },

    compile: function(text, style, callback) {
      var id = 'cb' + Date.now() + Math.random();
      Sass._callbacks[id] = callback;
  		Sass._worker.postMessage({
  		  command: 'compile',
  		  id: id,
  		  text: text,
  		  style: style
  		});
    }
  };

  Sass._worker = new Worker("libsass.worker.js");
  Sass._worker.addEventListener('message', function(event) {
		Sass._callbacks[event.data.id] && Sass._callbacks[event.data.id](event.data.result);
		delete Sass._callbacks[event.data.id];
	}, false);

  return Sass;
})();
