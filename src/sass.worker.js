'use strict';
/*global Sass, postMessage, onmessage:true, importScripts*/
importScripts('libsass.js', 'sass.js');

var _importerDone;
var _importerInit = function(request, done) {
  _importerDone = done;
  postMessage({
    command: '_importerInit',
    args: [request]
  });
};

var methods = {
  _importerFinish: function(result) {
    _importerDone && _importerDone(result);
    _importerDone = null;
  },

  importer: function(callback) {
    // an importer was un/set
    // we need to register a callback that will pipe
    // things through the worker
    Sass.importer(callback ? _importerInit : null);
  },
};

onmessage = function (event) {

  function done(result) {
    postMessage({
      id: event.data.id,
      result: result
    });
  }

  var method = methods[event.data.command] || Sass[event.data.command];

  if (!method) {
    return done({
      line: 0,
      message: 'Unknown command ' + event.action
    });
  }

  method.apply(Sass, (event.data.args || []).concat([done]));
};
