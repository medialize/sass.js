#include "sass_values.h"
#include "emscripten_sass_values.hpp"
#include <emscripten.h>

extern "C" {

// Not using size_t for array indices as the values used by the javascript code are signed.
void array_bounds_check(const int array_size, const int array_idx) {
  if (array_idx < 0 || array_idx >= array_size) {
    EM_ASM_INT({
      throw 'Array index ' + $0 + ' out of bounds: [0,' + $1 + ')';
    }, array_idx, array_size);
  }
}

// Emscripten_Sass_Warning

Emscripten_Sass_Warning* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Warning_Emscripten_Sass_Warning_1(char* arg0) {
  return new Emscripten_Sass_Warning(arg0);
}

char* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Warning_get_message_0(Emscripten_Sass_Warning* self) {
  return self->message;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Warning_set_message_1(Emscripten_Sass_Warning* self, char* arg0) {
  self->message = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Warning___destroy___0(Emscripten_Sass_Warning* self) {
  delete self;
}

// Emscripten_Sass_Map

Emscripten_Sass_Map* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Map_Emscripten_Sass_Map_0() {
  return new Emscripten_Sass_Map();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Map___destroy___0(Emscripten_Sass_Map* self) {
  delete self;
}

// Emscripten_Sass_Boolean

Emscripten_Sass_Boolean* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Boolean_Emscripten_Sass_Boolean_1(bool arg0) {
  return new Emscripten_Sass_Boolean(arg0);
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Boolean_get_value_0(Emscripten_Sass_Boolean* self) {
  return self->value;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Boolean_set_value_1(Emscripten_Sass_Boolean* self, bool arg0) {
  self->value = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Boolean___destroy___0(Emscripten_Sass_Boolean* self) {
  delete self;
}

// Emscripten_Sass

Emscripten_Sass* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Emscripten_Sass_0() {
  return new Emscripten_Sass();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass___destroy___0(Emscripten_Sass* self) {
  delete self;
}

// Emscripten_Sass_List

Emscripten_Sass_List* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_List_Emscripten_Sass_List_1(char* arg0) {
  return new Emscripten_Sass_List(arg0);
}

char* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_List_get_separator_0(Emscripten_Sass_List* self) {
  return self->separator;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_List_set_separator_1(Emscripten_Sass_List* self, char* arg0) {
  self->separator = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_List___destroy___0(Emscripten_Sass_List* self) {
  delete self;
}

// Emscripten_Sass_Unknown

Emscripten_Sass_Unknown* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Unknown_Emscripten_Sass_Unknown_0() {
  return new Emscripten_Sass_Unknown();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Unknown___destroy___0(Emscripten_Sass_Unknown* self) {
  delete self;
}

// Emscripten_Sass_Color

Emscripten_Sass_Color* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Color_Emscripten_Sass_Color_4(double arg0, double arg1, double arg2, double arg3) {
  return new Emscripten_Sass_Color(arg0, arg1, arg2, arg3);
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Color_get_r_0(Emscripten_Sass_Color* self) {
  return self->r;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Color_set_r_1(Emscripten_Sass_Color* self, double arg0) {
  self->r = arg0;
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Color_get_g_0(Emscripten_Sass_Color* self) {
  return self->g;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Color_set_g_1(Emscripten_Sass_Color* self, double arg0) {
  self->g = arg0;
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Color_get_b_0(Emscripten_Sass_Color* self) {
  return self->b;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Color_set_b_1(Emscripten_Sass_Color* self, double arg0) {
  self->b = arg0;
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Color_get_a_0(Emscripten_Sass_Color* self) {
  return self->a;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Color_set_a_1(Emscripten_Sass_Color* self, double arg0) {
  self->a = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Color___destroy___0(Emscripten_Sass_Color* self) {
  delete self;
}

// Emscripten_Sass_Null

Emscripten_Sass_Null* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Null_Emscripten_Sass_Null_0() {
  return new Emscripten_Sass_Null();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Null___destroy___0(Emscripten_Sass_Null* self) {
  delete self;
}

// Emscripten_Sass_String

Emscripten_Sass_String* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_String_Emscripten_Sass_String_1(char* arg0) {
  return new Emscripten_Sass_String(arg0);
}

char* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_String_get_value_0(Emscripten_Sass_String* self) {
  return self->value;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_String_set_value_1(Emscripten_Sass_String* self, char* arg0) {
  self->value = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_String___destroy___0(Emscripten_Sass_String* self) {
  delete self;
}

// VoidPtr

void EMSCRIPTEN_KEEPALIVE emscripten_bind_VoidPtr___destroy___0(void** self) {
  delete self;
}

// Emscripten_Sass_Error

Emscripten_Sass_Error* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Error_Emscripten_Sass_Error_1(char* arg0) {
  return new Emscripten_Sass_Error(arg0);
}

char* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Error_get_message_0(Emscripten_Sass_Error* self) {
  return self->message;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Error_set_message_1(Emscripten_Sass_Error* self, char* arg0) {
  self->message = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Error___destroy___0(Emscripten_Sass_Error* self) {
  delete self;
}

// Emscripten_Sass_Number

Emscripten_Sass_Number* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Number_Emscripten_Sass_Number_2(double arg0, char* arg1) {
  return new Emscripten_Sass_Number(arg0, arg1);
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Number_get_value_0(Emscripten_Sass_Number* self) {
  return self->value;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Number_set_value_1(Emscripten_Sass_Number* self, double arg0) {
  self->value = arg0;
}

char* EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Number_get_unit_0(Emscripten_Sass_Number* self) {
  return self->unit;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Number_set_unit_1(Emscripten_Sass_Number* self, char* arg0) {
  self->unit = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Emscripten_Sass_Number___destroy___0(Emscripten_Sass_Number* self) {
  delete self;
}

}

