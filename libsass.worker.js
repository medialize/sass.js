importScripts('libsass.min.js');

function compile(text, style) {
  // TODO: see http://kapadia.github.io/emscripten/2013/09/13/emscripten-pointers-and-pointers.html
  // for an idea about accessing a the `char **error_message` parameter - until then, this hack "works"
  try {
    // in C we would use char *ptr; foo(&ptr) - in EMScripten this is
    // not possible, so we allocate a pointer to a pointer on the stack
    // by hand
    var ptr_to_ptr = Module.allocate([0], 'i8', ALLOC_STACK);

    var result = Module.ccall('sass_compile_unrolled', 'string', ['string', 'number', 'i8'], [text, Number(style) || 0, ptr_to_ptr]);

    // this is equivalent to *ptr
    var err_str = Module.getValue(ptr_to_ptr, '*');

    // error string set? if not, it would be NULL and therefore 0
    if(err_str) {
      err_str = Module.Pointer_stringify(err_str); // interpret pointer as string

      var error = err_str.match(/^source string:(\d+):/);
      var message = err_str.slice(error[0].length);
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

onmessage = function (event) {
  var result = compile(event.data.text, event.data.style);
  postMessage({
    id: event.data.id,
    result: result
  });
};
