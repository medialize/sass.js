#include "sass_values.h"

/*
  http://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/WebIDL-Binder.html
  http://www.cplusplus.com/doc/tutorial/classes/

  python /usr/local/Cellar/emscripten/HEAD/libexec/tools/webidl_binder.py \
    emscripten_sass_values.idl \
    emscripten_sass_values_glue
*/

using namespace std;

class Emscripten_Sass {
public:
  union Sass_Value* toStruct() {
    return null;
  }
  static Emscripten_Sass_Boolean fromStruct(union Sass_Value* input) {
    // maybe we can use a switch instead?
    // enum Sass_Tag sass_value_get_tag (value[i]);
    if (sass_value_is_null(value)) {
      return Emscripten_Sass_Null::fromStruct(value);
    } else if (sass_value_is_number(value)) {
      return Emscripten_Sass_Number::fromStruct(value);
    } else if (sass_value_is_string(value)) {
      return Emscripten_Sass_String::fromStruct(value);
    } else if (sass_value_is_boolean(value)) {
      return Emscripten_Sass_Boolean::fromStruct(value);
    } else if (sass_value_is_color(value)) {
      return Emscripten_Sass_Color::fromStruct(value);
    } else if (sass_value_is_list(value)) {
      return Emscripten_Sass_List::fromStruct(value);
    } else if (sass_value_is_map(value)) {
      return Emscripten_Sass_Map::fromStruct(value);
    } else if (sass_value_is_error(value)) {
      return Emscripten_Sass_Error::fromStruct(value);
    } else if (sass_value_is_warning(value)) {
      return Emscripten_Sass_Warning::fromStruct(value);
    } else {
      return Emscripten_Sass_Unknown::fromStruct(value);
    }
  }
};

class Emscripten_Sass_Unknown : public Emscripten_Sass {
public:
  Emscripten_Sass_Unknown() {}
  union Sass_Value* toStruct() {
    return sass_make_null();
  }
  static Emscripten_Sass_Unknown fromStruct(union Sass_Value* input) {
    Emscripten_Sass_Unknown _value ();
    return _value;
  }
};

class Emscripten_Sass_Null : public Emscripten_Sass {
public:
  Emscripten_Sass_Null() {}
  union Sass_Value* toStruct() {
    return sass_make_null();
  }
  static Emscripten_Sass_Null fromStruct(union Sass_Value* input) {
    Emscripten_Sass_Null _value ();
    return _value;
  }
};

class Emscripten_Sass_Boolean : public Emscripten_Sass {
public:
  bool value;
  Emscripten_Sass_Boolean(bool v) {
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

class Emscripten_Sass_Number : public Emscripten_Sass {
public:
  double value;
  string unit;
  Emscripten_Sass_Number(double v, string u) {
    value = v;
    unit = u;
  }
  union Sass_Value* toStruct() {
    return sass_make_number(value, unit.c_str());
  }
  static Emscripten_Sass_Number fromStruct(union Sass_Value* input) {
    Emscripten_Sass_Number _value (sass_number_get_value(input), (string)sass_number_get_unit(input));
    return _value;
  }
};

class Emscripten_Sass_String : public Emscripten_Sass {
public:
  string value;
  Emscripten_Sass_String(string v) {
    value = v;
  }
  union Sass_Value* toStruct() {
    // TODO: figure out what sass_make_qstring() is
    return sass_make_string(value.c_str());
  }
  static Emscripten_Sass_String fromStruct(union Sass_Value* input) {
    Emscripten_Sass_String _value ((string)sass_string_get_value(input));
    return _value;
  }
};

class Emscripten_Sass_Color : public Emscripten_Sass {
public:
  double r;
  double g;
  double b;
  double a;
  Emscripten_Sass_Color(double _r, double _g, double _b, double _a) {
    r = _r;
    g = _g;
    b = _b;
    a = _a;
  }
  union Sass_Value* toStruct() {
    return sass_make_color(r, g, b, a);
  }
  static Emscripten_Sass_Color fromStruct(union Sass_Value* input) {
    Emscripten_Sass_Color _value (
      sass_color_get_r(input),
      sass_color_get_g(input),
      sass_color_get_b(input),
      sass_color_get_a(input)
    );
    return _value;
  }
};


class Emscripten_Sass_List : public Emscripten_Sass {
public:
  string separator;
  // http://www.cplusplus.com/reference/vector/vector/
  vector<Emscripten_sass> items;
  Emscripten_Sass_List(string s) {
    separator = s;
    items = vector<Emscripten_sass>();
  }
  union Sass_Value* toStruct() {
    size_t i;
    size_t length = items.size();
    union Sass_Value* list = sass_make_list(length, separator);
    for (i = 0; i < length; ++i) {
      sass_list_set_value(list, i, items.at(i).toStruct());
    }

    return list;
  }
  static Emscripten_Sass_List fromStruct(union Sass_Value* input) {
    Emscripten_Sass_List _value (sass_list_get_separator(input));
    size_t i;
    size_t length = sass_list_get_length(input);
    for (i = 0; i < length; ++i) {
      Emscripten_Sass _item = Emscripten_Sass::fromStruct(sass_list_get_value(input, i));
      _value.items.push_back(_item);
    }

    return _value;
  }
};

class Emscripten_Sass_Map : public Emscripten_Sass {
public:
  string separator;
  // http://www.cplusplus.com/reference/map/map/
  // http://www.cplusplus.com/reference/unordered_map/unordered_map/
  unordered_map<Emscripten_Sass,Emscripten_Sass> items;
  Emscripten_Sass_Map() {
    items = unordered_map<Emscripten_Sass,Emscripten_Sass>();
  }
  union Sass_Value* toStruct() {
    size_t i;
    size_t length = items.size();
    union Sass_Value* map = sass_make_map(length);
    for (auto& item: items) {
      sass_map_set_key(map, i, item.first.toStruct());
      sass_map_set_value(map, i, item.second.toStruct());
    }

    return map;
  }
  static Emscripten_Sass_Map fromStruct(union Sass_Value* input) {
    Emscripten_Sass_Map _value ();
    size_t i;
    size_t length = sass_map_get_length(input);
    for (i = 0; i < length; ++i) {
      Emscripten_Sass pairKey = Emscripten_Sass::fromStruct(sass_map_get_key(input, i));
      Emscripten_Sass pairValue = Emscripten_Sass::fromStruct(sass_map_get_value(input, i));
      _value.items.insert(pair<Emscripten_Sass,Emscripten_Sass>(pairKey, pairValue));
    }

    return _value;
  }
};

class Emscripten_Sass_Error : public Emscripten_Sass {
public:
  string message;
  Emscripten_Sass_Error(string v) {
    message = v;
  }
  union Sass_Value* toStruct() {
    return sass_make_error(message.c_str());
  }
  static Emscripten_Sass_Error fromStruct(union Sass_Value* input) {
    Emscripten_Sass_Error _value ((string)sass_error_get_message(input));
    return _value;
  }
};

class Emscripten_Sass_Warning : public Emscripten_Sass {
public:
  string message;
  Emscripten_Sass_Warning(string v) {
    message = v;
  }
  union Sass_Value* toStruct() {
    return sass_make_warning(message.c_str());
  }
  static Emscripten_Sass_Warning fromStruct(union Sass_Value* input) {
    Emscripten_Sass_Warning _value ((string)sass_warning_get_message(input));
    return _value;
  }
};
