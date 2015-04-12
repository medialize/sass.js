/*! sass.js - v0.0.0 (1c01355) - built 2015-04-12
  providing libsass 3.2.0-beta.5 (f82a41b)
  via emscripten 1.30.2 (dac9f88)
 */
(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Sass = factory();
  }
}(this, function () {
  'use strict';
  /*global Worker*/

  var noop = function(){};

  var Sass = {
    _worker: null,
    _callbacks: {},

    style: {
      nested: 0,
      expanded: 1,
      compact: 2,
      compressed: 3
    },
    comments: {
      'none': 0,
      'default': 1
    },

    _dispatch: function(options, callback) {
      options.id = 'cb' + Date.now() + Math.random();
      Sass._callbacks[options.id] = callback;
      Sass._worker.postMessage(options);
    },

    _eval: function(func, callback) {
      Sass._dispatch({
        command: '_eval',
        args: [String(func)]
      }, callback);
    },

    initialize: function(workerUrl) {
      if (Sass._worker) {
        throw new Error('Sass Worker is already initalized');
      }

      Sass._worker = new Worker(workerUrl);
      Sass._worker.addEventListener('message', function(event) {
        Sass._callbacks[event.data.id] && Sass._callbacks[event.data.id](event.data.result);
        delete Sass._callbacks[event.data.id];
      }, false);
    }
  };

  var commands = 'writeFile readFile listFiles removeFile clearFiles lazyFiles preloadFiles options compile';
  var slice = [].slice;
  commands.split(' ').forEach(function(command) {
    Sass[command] = function() {
      var callback = slice.call(arguments, -1)[0];
      var args = slice.call(arguments, 0, -1);
      if (typeof callback !== 'function') {
        args.push(callback);
        callback = noop;
      }

      Sass._dispatch({
        command: command,
        args: args
      }, callback);
    };
  });

  return Sass;
}));