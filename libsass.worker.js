'use strict';
importScripts('libsass.min.js', 'sass.js');

onmessage = function (event) {
  var result;
  switch (event.data.command) {
    case 'compile':
      result = Sass.compile(event.data.text);
      break;
    case 'options':
      result = Sass.options(event.data.options);
      break;
    case 'writeFile':
      result = Sass.writeFile(event.data.filename, event.data.text);
      break;
    case 'writeFile':
      result = Sass.removeFile(event.data.filename);
      break;
    default:
      result = {line: 0, message: "Unknown command " + event.action};
      break;
  }

  postMessage({
    id: event.data.id,
    result: result
  });
};
