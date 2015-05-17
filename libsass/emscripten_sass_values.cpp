#include "sass_values.h"

class Emscripten_Sass_Boolean {
  bool value;

public:
  Emscripten_Sass_Boolean(bool v) {
    value = v;
  }
  bool getValue() {
    return value;
  }
  void setValue(bool v) {
    value = v;
  }
  union Sass_Value* toStruct() {
    return sass_make_boolean(value);
  }
  static Emscripten_Sass_Boolean fromStruct(union Sass_Value* input) {
    Emscripten_Sass_Boolean _value (sass_boolean_get_value(input));
    return _value;
  }
};


/*
  http://www.cplusplus.com/doc/tutorial/classes/

  python /usr/local/Cellar/emscripten/HEAD/libexec/tools/webidl_binder.py \
    emscripten_sass_values.idl \
    emscripten_sass_values_glue
*/