
#ifndef _EMSCRIPTEN_WRAPPER_H
#define _EMSCRIPTEN_WRAPPER_H

#ifdef __cplusplus
extern "C" {
using namespace std;
#endif

void sass_compile_emscripten(
  char *source_string,
  char *include_paths,
  bool compile_file,
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

#ifdef __cplusplus
}
#endif


#endif
