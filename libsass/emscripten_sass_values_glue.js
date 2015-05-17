
// Bindings utilities

function WrapperObject() {
}
WrapperObject.prototype = Object.create(WrapperObject.prototype);
WrapperObject.prototype.constructor = WrapperObject;
WrapperObject.prototype.__class__ = WrapperObject;
WrapperObject.__cache__ = {};
Module['WrapperObject'] = WrapperObject;

function getCache(__class__) {
  return (__class__ || WrapperObject).__cache__;
}
Module['getCache'] = getCache;

function wrapPointer(ptr, __class__) {
  var cache = getCache(__class__);
  var ret = cache[ptr];
  if (ret) return ret;
  ret = Object.create((__class__ || WrapperObject).prototype);
  ret.ptr = ptr;
  return cache[ptr] = ret;
}
Module['wrapPointer'] = wrapPointer;

function castObject(obj, __class__) {
  return wrapPointer(obj.ptr, __class__);
}
Module['castObject'] = castObject;

Module['NULL'] = wrapPointer(0);

function destroy(obj) {
  if (!obj['__destroy__']) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
  obj['__destroy__']();
  // Remove from cache, so the object can be GC'd and refs added onto it released
  delete getCache(obj.__class__)[obj.ptr];
}
Module['destroy'] = destroy;

function compare(obj1, obj2) {
  return obj1.ptr === obj2.ptr;
}
Module['compare'] = compare;

function getPointer(obj) {
  return obj.ptr;
}
Module['getPointer'] = getPointer;

function getClass(obj) {
  return obj.__class__;
}
Module['getClass'] = getClass;

// Converts a value into a C-style string.
var ensureString = (function() {
  var stringCache = {};
  function ensureString(value) {
    if (typeof value == 'string') {
      var cachedVal = stringCache[value];
      if (cachedVal) return cachedVal;
      var ret = allocate(intArrayFromString(value), 'i8', ALLOC_STACK);
      stringCache[value] = ret;
      return ret;
    }
    return value;
  }
  return ensureString;
})();


// Emscripten_Sass_Warning
function Emscripten_Sass_Warning(arg0) {
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  this.ptr = _emscripten_bind_Emscripten_Sass_Warning_Emscripten_Sass_Warning_1(arg0);
  getCache(Emscripten_Sass_Warning)[this.ptr] = this;
};;
Emscripten_Sass_Warning.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass_Warning.prototype.constructor = Emscripten_Sass_Warning;
Emscripten_Sass_Warning.prototype.__class__ = Emscripten_Sass_Warning;
Emscripten_Sass_Warning.__cache__ = {};
Module['Emscripten_Sass_Warning'] = Emscripten_Sass_Warning;

  Emscripten_Sass_Warning.prototype['get_message'] = Emscripten_Sass_Warning.prototype.get_message = function() {
  var self = this.ptr;
  return Pointer_stringify(_emscripten_bind_Emscripten_Sass_Warning_get_message_0(self));
};
    Emscripten_Sass_Warning.prototype['set_message'] = Emscripten_Sass_Warning.prototype.set_message = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_Warning_set_message_1(self, arg0);
};
  Emscripten_Sass_Warning.prototype['__destroy__'] = Emscripten_Sass_Warning.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass_Warning___destroy___0(self);
};
// Emscripten_Sass_Map
function Emscripten_Sass_Map() {
  this.ptr = _emscripten_bind_Emscripten_Sass_Map_Emscripten_Sass_Map_0();
  getCache(Emscripten_Sass_Map)[this.ptr] = this;
};;
Emscripten_Sass_Map.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass_Map.prototype.constructor = Emscripten_Sass_Map;
Emscripten_Sass_Map.prototype.__class__ = Emscripten_Sass_Map;
Emscripten_Sass_Map.__cache__ = {};
Module['Emscripten_Sass_Map'] = Emscripten_Sass_Map;

  Emscripten_Sass_Map.prototype['__destroy__'] = Emscripten_Sass_Map.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass_Map___destroy___0(self);
};
// Emscripten_Sass_Boolean
function Emscripten_Sass_Boolean(arg0) {
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  this.ptr = _emscripten_bind_Emscripten_Sass_Boolean_Emscripten_Sass_Boolean_1(arg0);
  getCache(Emscripten_Sass_Boolean)[this.ptr] = this;
};;
Emscripten_Sass_Boolean.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass_Boolean.prototype.constructor = Emscripten_Sass_Boolean;
Emscripten_Sass_Boolean.prototype.__class__ = Emscripten_Sass_Boolean;
Emscripten_Sass_Boolean.__cache__ = {};
Module['Emscripten_Sass_Boolean'] = Emscripten_Sass_Boolean;

  Emscripten_Sass_Boolean.prototype['get_value'] = Emscripten_Sass_Boolean.prototype.get_value = function() {
  var self = this.ptr;
  return _emscripten_bind_Emscripten_Sass_Boolean_get_value_0(self);
};
    Emscripten_Sass_Boolean.prototype['set_value'] = Emscripten_Sass_Boolean.prototype.set_value = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_Boolean_set_value_1(self, arg0);
};
  Emscripten_Sass_Boolean.prototype['__destroy__'] = Emscripten_Sass_Boolean.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass_Boolean___destroy___0(self);
};
// Emscripten_Sass
function Emscripten_Sass() {
  this.ptr = _emscripten_bind_Emscripten_Sass_Emscripten_Sass_0();
  getCache(Emscripten_Sass)[this.ptr] = this;
};;
Emscripten_Sass.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass.prototype.constructor = Emscripten_Sass;
Emscripten_Sass.prototype.__class__ = Emscripten_Sass;
Emscripten_Sass.__cache__ = {};
Module['Emscripten_Sass'] = Emscripten_Sass;

  Emscripten_Sass.prototype['__destroy__'] = Emscripten_Sass.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass___destroy___0(self);
};
// Emscripten_Sass_List
function Emscripten_Sass_List(arg0) {
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  this.ptr = _emscripten_bind_Emscripten_Sass_List_Emscripten_Sass_List_1(arg0);
  getCache(Emscripten_Sass_List)[this.ptr] = this;
};;
Emscripten_Sass_List.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass_List.prototype.constructor = Emscripten_Sass_List;
Emscripten_Sass_List.prototype.__class__ = Emscripten_Sass_List;
Emscripten_Sass_List.__cache__ = {};
Module['Emscripten_Sass_List'] = Emscripten_Sass_List;

  Emscripten_Sass_List.prototype['get_separator'] = Emscripten_Sass_List.prototype.get_separator = function() {
  var self = this.ptr;
  return Pointer_stringify(_emscripten_bind_Emscripten_Sass_List_get_separator_0(self));
};
    Emscripten_Sass_List.prototype['set_separator'] = Emscripten_Sass_List.prototype.set_separator = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_List_set_separator_1(self, arg0);
};
  Emscripten_Sass_List.prototype['__destroy__'] = Emscripten_Sass_List.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass_List___destroy___0(self);
};
// Emscripten_Sass_Unknown
function Emscripten_Sass_Unknown() {
  this.ptr = _emscripten_bind_Emscripten_Sass_Unknown_Emscripten_Sass_Unknown_0();
  getCache(Emscripten_Sass_Unknown)[this.ptr] = this;
};;
Emscripten_Sass_Unknown.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass_Unknown.prototype.constructor = Emscripten_Sass_Unknown;
Emscripten_Sass_Unknown.prototype.__class__ = Emscripten_Sass_Unknown;
Emscripten_Sass_Unknown.__cache__ = {};
Module['Emscripten_Sass_Unknown'] = Emscripten_Sass_Unknown;

  Emscripten_Sass_Unknown.prototype['__destroy__'] = Emscripten_Sass_Unknown.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass_Unknown___destroy___0(self);
};
// Emscripten_Sass_Color
function Emscripten_Sass_Color(arg0, arg1, arg2, arg3) {
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  else arg1 = ensureString(arg1);
  if (arg2 && typeof arg2 === 'object') arg2 = arg2.ptr;
  else arg2 = ensureString(arg2);
  if (arg3 && typeof arg3 === 'object') arg3 = arg3.ptr;
  else arg3 = ensureString(arg3);
  this.ptr = _emscripten_bind_Emscripten_Sass_Color_Emscripten_Sass_Color_4(arg0, arg1, arg2, arg3);
  getCache(Emscripten_Sass_Color)[this.ptr] = this;
};;
Emscripten_Sass_Color.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass_Color.prototype.constructor = Emscripten_Sass_Color;
Emscripten_Sass_Color.prototype.__class__ = Emscripten_Sass_Color;
Emscripten_Sass_Color.__cache__ = {};
Module['Emscripten_Sass_Color'] = Emscripten_Sass_Color;

  Emscripten_Sass_Color.prototype['get_r'] = Emscripten_Sass_Color.prototype.get_r = function() {
  var self = this.ptr;
  return _emscripten_bind_Emscripten_Sass_Color_get_r_0(self);
};
    Emscripten_Sass_Color.prototype['set_r'] = Emscripten_Sass_Color.prototype.set_r = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_Color_set_r_1(self, arg0);
};
  Emscripten_Sass_Color.prototype['get_g'] = Emscripten_Sass_Color.prototype.get_g = function() {
  var self = this.ptr;
  return _emscripten_bind_Emscripten_Sass_Color_get_g_0(self);
};
    Emscripten_Sass_Color.prototype['set_g'] = Emscripten_Sass_Color.prototype.set_g = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_Color_set_g_1(self, arg0);
};
  Emscripten_Sass_Color.prototype['get_b'] = Emscripten_Sass_Color.prototype.get_b = function() {
  var self = this.ptr;
  return _emscripten_bind_Emscripten_Sass_Color_get_b_0(self);
};
    Emscripten_Sass_Color.prototype['set_b'] = Emscripten_Sass_Color.prototype.set_b = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_Color_set_b_1(self, arg0);
};
  Emscripten_Sass_Color.prototype['get_a'] = Emscripten_Sass_Color.prototype.get_a = function() {
  var self = this.ptr;
  return _emscripten_bind_Emscripten_Sass_Color_get_a_0(self);
};
    Emscripten_Sass_Color.prototype['set_a'] = Emscripten_Sass_Color.prototype.set_a = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_Color_set_a_1(self, arg0);
};
  Emscripten_Sass_Color.prototype['__destroy__'] = Emscripten_Sass_Color.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass_Color___destroy___0(self);
};
// Emscripten_Sass_Null
function Emscripten_Sass_Null() {
  this.ptr = _emscripten_bind_Emscripten_Sass_Null_Emscripten_Sass_Null_0();
  getCache(Emscripten_Sass_Null)[this.ptr] = this;
};;
Emscripten_Sass_Null.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass_Null.prototype.constructor = Emscripten_Sass_Null;
Emscripten_Sass_Null.prototype.__class__ = Emscripten_Sass_Null;
Emscripten_Sass_Null.__cache__ = {};
Module['Emscripten_Sass_Null'] = Emscripten_Sass_Null;

  Emscripten_Sass_Null.prototype['__destroy__'] = Emscripten_Sass_Null.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass_Null___destroy___0(self);
};
// Emscripten_Sass_String
function Emscripten_Sass_String(arg0) {
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  this.ptr = _emscripten_bind_Emscripten_Sass_String_Emscripten_Sass_String_1(arg0);
  getCache(Emscripten_Sass_String)[this.ptr] = this;
};;
Emscripten_Sass_String.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass_String.prototype.constructor = Emscripten_Sass_String;
Emscripten_Sass_String.prototype.__class__ = Emscripten_Sass_String;
Emscripten_Sass_String.__cache__ = {};
Module['Emscripten_Sass_String'] = Emscripten_Sass_String;

  Emscripten_Sass_String.prototype['get_value'] = Emscripten_Sass_String.prototype.get_value = function() {
  var self = this.ptr;
  return Pointer_stringify(_emscripten_bind_Emscripten_Sass_String_get_value_0(self));
};
    Emscripten_Sass_String.prototype['set_value'] = Emscripten_Sass_String.prototype.set_value = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_String_set_value_1(self, arg0);
};
  Emscripten_Sass_String.prototype['__destroy__'] = Emscripten_Sass_String.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass_String___destroy___0(self);
};
// VoidPtr
function VoidPtr() { throw "cannot construct a VoidPtr, no constructor in IDL" }
VoidPtr.prototype = Object.create(WrapperObject.prototype);
VoidPtr.prototype.constructor = VoidPtr;
VoidPtr.prototype.__class__ = VoidPtr;
VoidPtr.__cache__ = {};
Module['VoidPtr'] = VoidPtr;

  VoidPtr.prototype['__destroy__'] = VoidPtr.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_VoidPtr___destroy___0(self);
};
// Emscripten_Sass_Error
function Emscripten_Sass_Error(arg0) {
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  this.ptr = _emscripten_bind_Emscripten_Sass_Error_Emscripten_Sass_Error_1(arg0);
  getCache(Emscripten_Sass_Error)[this.ptr] = this;
};;
Emscripten_Sass_Error.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass_Error.prototype.constructor = Emscripten_Sass_Error;
Emscripten_Sass_Error.prototype.__class__ = Emscripten_Sass_Error;
Emscripten_Sass_Error.__cache__ = {};
Module['Emscripten_Sass_Error'] = Emscripten_Sass_Error;

  Emscripten_Sass_Error.prototype['get_message'] = Emscripten_Sass_Error.prototype.get_message = function() {
  var self = this.ptr;
  return Pointer_stringify(_emscripten_bind_Emscripten_Sass_Error_get_message_0(self));
};
    Emscripten_Sass_Error.prototype['set_message'] = Emscripten_Sass_Error.prototype.set_message = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_Error_set_message_1(self, arg0);
};
  Emscripten_Sass_Error.prototype['__destroy__'] = Emscripten_Sass_Error.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass_Error___destroy___0(self);
};
// Emscripten_Sass_Number
function Emscripten_Sass_Number(arg0, arg1) {
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  else arg1 = ensureString(arg1);
  this.ptr = _emscripten_bind_Emscripten_Sass_Number_Emscripten_Sass_Number_2(arg0, arg1);
  getCache(Emscripten_Sass_Number)[this.ptr] = this;
};;
Emscripten_Sass_Number.prototype = Object.create(WrapperObject.prototype);
Emscripten_Sass_Number.prototype.constructor = Emscripten_Sass_Number;
Emscripten_Sass_Number.prototype.__class__ = Emscripten_Sass_Number;
Emscripten_Sass_Number.__cache__ = {};
Module['Emscripten_Sass_Number'] = Emscripten_Sass_Number;

  Emscripten_Sass_Number.prototype['get_value'] = Emscripten_Sass_Number.prototype.get_value = function() {
  var self = this.ptr;
  return _emscripten_bind_Emscripten_Sass_Number_get_value_0(self);
};
    Emscripten_Sass_Number.prototype['set_value'] = Emscripten_Sass_Number.prototype.set_value = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_Number_set_value_1(self, arg0);
};
  Emscripten_Sass_Number.prototype['get_unit'] = Emscripten_Sass_Number.prototype.get_unit = function() {
  var self = this.ptr;
  return Pointer_stringify(_emscripten_bind_Emscripten_Sass_Number_get_unit_0(self));
};
    Emscripten_Sass_Number.prototype['set_unit'] = Emscripten_Sass_Number.prototype.set_unit = function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0);
  _emscripten_bind_Emscripten_Sass_Number_set_unit_1(self, arg0);
};
  Emscripten_Sass_Number.prototype['__destroy__'] = Emscripten_Sass_Number.prototype.__destroy__ = function() {
  var self = this.ptr;
  _emscripten_bind_Emscripten_Sass_Number___destroy___0(self);
};
(function() {
  function setupEnums() {
    
  }
  if (Module['calledRun']) setupEnums();
  else addOnPreMain(setupEnums);
})();
