'use strict';
/*global Sass, postMessage, onmessage:true, importScripts*/
importScripts('libsass.js', 'sass.js');

onmessage = function (event) {

  function done(result) {
    postMessage({
      id: event.data.id,
      result: result
    });
  }

  var method = Sass[event.data.command];

  if (event.data.command === '_eval') {
    method = function(callback) {
      var func = new Function('return ' + event.data.func)();
      result = func.call(Sass);
      callback(result);
    }
  } else if (!method) {
    return done({
      line: 0,
      message: 'Unknown command ' + event.action
    });
  }

  method.apply(Sass, (event.data.args || []).concat([done]));
};
