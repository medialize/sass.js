/*global Module*/
/*jshint strict:false, unused:false*/

function noop(){}


function stripLeadingSlash(text) {
  return text.slice(0, 1) === '/' ? text.slice(1) : text;
}

function addLeadingSlash(text) {
  return text.slice(0, 1) !== '/' ? ('/' + text) : text;
}

function stripTrailingSlash(text) {
  return text.slice(-1) === '/' ? text.slice(0, -1) : text;
}

function addTrailingSlash(text) {
  return text.slice(-1) !== '/' ? (text + '/') : text;
}


function pointerToString(pointer) {
  /*jshint camelcase:false*/
  return pointer && Module.Pointer_stringify(pointer) || null;
}

function stringToPointer(text) {
  var buffer = Module._malloc(text.length + 1);
  Module.writeStringToMemory(text, buffer);
  return buffer;
}

function pointerToJson(pointer) {
  var test = pointerToString(pointer);
  return test && JSON.parse(test) || null;
}

function pointerToStringArray(pointer) {
  var list = [];
  if (!pointer) {
    return list;
  }

  // TODO: are we limited to 32bit?
  for (var i=0; true; i+=4) {
    var _pointer = Module.getValue(pointer + i, '*');
    if (!_pointer) {
      break;
    }

    var _item = pointerToString(_pointer);
    _item && list.push(_item);
  }

  return list;
}
