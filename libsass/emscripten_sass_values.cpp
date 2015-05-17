#include <cstdlib>
#include <cstring>
#include "sass_values.h"
#include "emscripten_sass_values.hpp"

/*
  http://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/WebIDL-Binder.html
  http://www.cplusplus.com/doc/tutorial/classes/

  python /usr/local/Cellar/emscripten/HEAD/libexec/tools/webidl_binder.py \
    emscripten_sass_values.idl \
    emscripten_sass_values_glue
*/

using namespace std;



union Sass_Value* Emscripten_Sass::toStruct() {
  return NULL;
};
Emscripten_Sass Emscripten_Sass::fromStruct(const union Sass_Value* input) {
  // maybe we can use a switch instead?
  // enum Sass_Tag sass_value_get_tag (value[i]);
  if (sass_value_is_null(input)) {
    return Emscripten_Sass_Null::fromStruct(input);
  } else if (sass_value_is_number(input)) {
    return Emscripten_Sass_Number::fromStruct(input);
  } else if (sass_value_is_string(input)) {
    return Emscripten_Sass_String::fromStruct(input);
  } else if (sass_value_is_boolean(input)) {
    return Emscripten_Sass_Boolean::fromStruct(input);
  } else if (sass_value_is_color(input)) {
    return Emscripten_Sass_Color::fromStruct(input);
  } else if (sass_value_is_list(input)) {
    return Emscripten_Sass_List::fromStruct(input);
  } else if (sass_value_is_map(input)) {
    return Emscripten_Sass_Map::fromStruct(input);
  } else if (sass_value_is_error(input)) {
    return Emscripten_Sass_Error::fromStruct(input);
  } else if (sass_value_is_warning(input)) {
    return Emscripten_Sass_Warning::fromStruct(input);
  } else {
    return Emscripten_Sass_Unknown::fromStruct(input);
  }
};



union Sass_Value* Emscripten_Sass_Unknown::toStruct() {
  return sass_make_null();
};
Emscripten_Sass_Unknown Emscripten_Sass_Unknown::fromStruct(const union Sass_Value* input) {
  Emscripten_Sass_Unknown _value;
  return _value;
};



union Sass_Value* Emscripten_Sass_Null::toStruct() {
  return sass_make_null();
};
Emscripten_Sass_Null Emscripten_Sass_Null::fromStruct(const union Sass_Value* input) {
  Emscripten_Sass_Null _value;
  return _value;
};



Emscripten_Sass_Boolean::Emscripten_Sass_Boolean(bool v) {
  value = v;
};
union Sass_Value* Emscripten_Sass_Boolean::toStruct() {
  return sass_make_boolean(value);
};
Emscripten_Sass_Boolean Emscripten_Sass_Boolean::fromStruct(const union Sass_Value* input) {
  Emscripten_Sass_Boolean _value (sass_boolean_get_value(input));
  return _value;
};



Emscripten_Sass_Number::Emscripten_Sass_Number(double v, string u) {
  value = v;
  unit = u;
};
union Sass_Value* Emscripten_Sass_Number::toStruct() {
  return sass_make_number(value, unit.c_str());
};
Emscripten_Sass_Number Emscripten_Sass_Number::fromStruct(const union Sass_Value* input) {
  Emscripten_Sass_Number _value (sass_number_get_value(input), (string)sass_number_get_unit(input));
  return _value;
};



Emscripten_Sass_String::Emscripten_Sass_String(string v) {
  value = v;
};
union Sass_Value* Emscripten_Sass_String::toStruct() {
  // TODO: figure out what sass_make_qstring() is
  return sass_make_string(value.c_str());
};
Emscripten_Sass_String Emscripten_Sass_String::fromStruct(const union Sass_Value* input) {
  Emscripten_Sass_String _value ((string)sass_string_get_value(input));
  return _value;
};



Emscripten_Sass_Color::Emscripten_Sass_Color(double _r, double _g, double _b, double _a) {
  r = _r;
  g = _g;
  b = _b;
  a = _a;
};
union Sass_Value* Emscripten_Sass_Color::toStruct() {
  return sass_make_color(r, g, b, a);
};
Emscripten_Sass_Color Emscripten_Sass_Color::fromStruct(const union Sass_Value* input) {
  Emscripten_Sass_Color _value (
    sass_color_get_r(input),
    sass_color_get_g(input),
    sass_color_get_b(input),
    sass_color_get_a(input)
  );
  return _value;
};



Emscripten_Sass_List::Emscripten_Sass_List(string s) {
  separator = s;
  items = vector<Emscripten_Sass>();
};
union Sass_Value* Emscripten_Sass_List::toStruct() {
  size_t i;
  size_t length = items.size();
  union Sass_Value* list = sass_make_list(length, separator == "," ? SASS_COMMA : SASS_SPACE);
  for (i = 0; i < length; ++i) {
    sass_list_set_value(list, i, items.at(i).toStruct());
  }

  return list;
};
Emscripten_Sass_List Emscripten_Sass_List::fromStruct(const union Sass_Value* input) {
  Emscripten_Sass_List _value (sass_list_get_separator(input) == SASS_COMMA ? "," : " ");
  size_t i;
  size_t length = sass_list_get_length(input);
  for (i = 0; i < length; ++i) {
    Emscripten_Sass _item = Emscripten_Sass::fromStruct(sass_list_get_value(input, i));
    _value.items.push_back(_item);
  }

  return _value;
};



Emscripten_Sass_Map::Emscripten_Sass_Map() {
  // items = map<Emscripten_Sass,Emscripten_Sass>();
};
union Sass_Value* Emscripten_Sass_Map::toStruct() {
  // size_t i;
  // size_t length = items.size();
  // union Sass_Value* map = sass_make_map(length);
  // for (auto& item: items) {
  //   sass_map_set_key(map, i, item.first.toStruct());
  //   sass_map_set_value(map, i, item.second.toStruct());
  // }
  // 
  // return map;
  return sass_make_map(0);
};
Emscripten_Sass_Map Emscripten_Sass_Map::fromStruct(const union Sass_Value* input) {
  Emscripten_Sass_Map _value;
  // size_t i;
  // size_t length = sass_map_get_length(input);
  // for (i = 0; i < length; ++i) {
  //   Emscripten_Sass pairKey = Emscripten_Sass::fromStruct(sass_map_get_key(input, i));
  //   Emscripten_Sass pairValue = Emscripten_Sass::fromStruct(sass_map_get_value(input, i));
  //   _value.items.insert(pair<Emscripten_Sass,Emscripten_Sass>(pairKey, pairValue));
  // }
  // 
  return _value;
};



Emscripten_Sass_Error::Emscripten_Sass_Error(string v) {
  message = v;
};
union Sass_Value* Emscripten_Sass_Error::toStruct() {
  return sass_make_error(message.c_str());
};
Emscripten_Sass_Error Emscripten_Sass_Error::fromStruct(const union Sass_Value* input) {
  Emscripten_Sass_Error _value ((string)sass_error_get_message(input));
  return _value;
};



Emscripten_Sass_Warning::Emscripten_Sass_Warning(string v) {
  message = v;
};
union Sass_Value* Emscripten_Sass_Warning::toStruct() {
  return sass_make_warning(message.c_str());
};
Emscripten_Sass_Warning Emscripten_Sass_Warning::fromStruct(const union Sass_Value* input) {
  Emscripten_Sass_Warning _value ((string)sass_warning_get_message(input));
  return _value;
};
