
#ifndef _EMSCRIPTEN_WRAPPER_H
#define _EMSCRIPTEN_WRAPPER_H

#ifdef __cplusplus
extern "C" {
using namespace std;
#endif

void sass_compile_emscripten(
  char *source_string,
  char *include_paths,
  bool custom_importer,
  int output_style,
  int precision,
  bool source_comments,
  bool is_indented_syntax_src,
  bool source_map_contents,
  bool source_map_embed,
  bool omit_source_map_url,
  char *source_map_root,
  char *source_map_file,
  char *input_path,
  char *output_path,
  char *indent,
  char *linefeed
);

struct Sass_Import** sass_importer_emscripten(
  const char* cur_path, Sass_Importer_Entry cb,
  struct Sass_Compiler* comp
);

union Sass_Value* sass_function_emscripten(
  const union Sass_Value* s_args,
  Sass_Function_Entry cb,
  struct Sass_Options* opts
);

void sass_value_to_js(const union Sass_Value* value);
const union Sass_Value* sass_value_from_js();

#ifdef __cplusplus
}
#endif


#endif
