
#ifndef _EMSCRIPTEN_SASS_VALUES_H
#define _EMSCRIPTEN_SASS_VALUES_H

#include <map>
#include <vector>
#include <iostream>

using namespace std;

// shouldn't this be abstract?
class Emscripten_Sass {
public:
  union Sass_Value* toStruct();
  static Emscripten_Sass fromStruct(const union Sass_Value* input);
};

class Emscripten_Sass_Unknown : public Emscripten_Sass {
public:
  Emscripten_Sass_Unknown();
  union Sass_Value* toStruct();
  static Emscripten_Sass_Unknown fromStruct(const union Sass_Value* input);
};

class Emscripten_Sass_Null : public Emscripten_Sass {
public:
  Emscripten_Sass_Null();
  union Sass_Value* toStruct();
  static Emscripten_Sass_Null fromStruct(const union Sass_Value* input);
};

class Emscripten_Sass_Boolean : public Emscripten_Sass {
public:
  bool value;
  Emscripten_Sass_Boolean(bool v);
  union Sass_Value* toStruct();
  static Emscripten_Sass_Boolean fromStruct(const union Sass_Value* input);
};

class Emscripten_Sass_Number : public Emscripten_Sass {
public:
  double value;
  char* unit;
  Emscripten_Sass_Number(double v, char* u);
  union Sass_Value* toStruct();
  static Emscripten_Sass_Number fromStruct(const union Sass_Value* input);
};

class Emscripten_Sass_String : public Emscripten_Sass {
public:
  char* value;
  Emscripten_Sass_String(char* v);
  union Sass_Value* toStruct();
  static Emscripten_Sass_String fromStruct(const union Sass_Value* input);
};

class Emscripten_Sass_Color : public Emscripten_Sass {
public:
  double r;
  double g;
  double b;
  double a;
  Emscripten_Sass_Color(double _r, double _g, double _b, double _a);
  union Sass_Value* toStruct();
  static Emscripten_Sass_Color fromStruct(const union Sass_Value* input);
};

class Emscripten_Sass_List : public Emscripten_Sass {
public:
  char* separator;
  // http://www.cplusplus.com/reference/vector/vector/
  vector<Emscripten_Sass> items;
  Emscripten_Sass_List(char* s);
  union Sass_Value* toStruct();
  static Emscripten_Sass_List fromStruct(const union Sass_Value* input);
};

class Emscripten_Sass_Map : public Emscripten_Sass {
public:
  char* separator;
  // http://www.cplusplus.com/reference/map/map/
  // http://www.cplusplus.com/reference/unordered_map/unordered_map/
  // map<Emscripten_Sass,Emscripten_Sass> items;
  Emscripten_Sass_Map();
  union Sass_Value* toStruct();
  static Emscripten_Sass_Map fromStruct(const union Sass_Value* input);
};

class Emscripten_Sass_Error : public Emscripten_Sass {
public:
  char* message;
  Emscripten_Sass_Error(char* v);
  union Sass_Value* toStruct();
  static Emscripten_Sass_Error fromStruct(const union Sass_Value* input);
};

class Emscripten_Sass_Warning : public Emscripten_Sass {
public:
  char* message;
  Emscripten_Sass_Warning(char* v);
  union Sass_Value* toStruct();
  static Emscripten_Sass_Warning fromStruct(const union Sass_Value* input);
};

#endif
