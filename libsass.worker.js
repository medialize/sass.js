importScripts('libsass.min.js');

function compile(text, style) {
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

onmessage = function (event) {
  var result = compile(event.data.text, event.data.style);
  postMessage({
    id: event.data.id,
    result: result
  });
};