
#ifndef _EMSCRIPTEN_WRAPPER_H
#define _EMSCRIPTEN_WRAPPER_H

#ifdef __cplusplus
extern "C" {
using namespace std;
#endif

char *sass_compile_emscripten(
  char *source_string,
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
  char *linefeed,
  char *include_paths,
  char **source_map_string,
  char ***included_files,
  char **error_message,
  char **error_json
);

#ifdef __cplusplus
}
#endif


#endif
