#include <cstdlib>
#include <cstring>
#include "sass_context.h"
#include "emscripten_wrapper.hpp"

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
  char **included_files,
  char **error_message
) {
  char *output_string;

  // I suck at C and I'm probably doing this way wrong
  Sass_Output_Style sass_output_style;
  switch (output_style) {
    case 3:
      sass_output_style = SASS_STYLE_COMPRESSED;
      break;

    case 2:
      sass_output_style = SASS_STYLE_COMPACT;
      break;

    case 1:
      sass_output_style = SASS_STYLE_EXPANDED;
      break;

    case 0:
    default:
      sass_output_style = SASS_STYLE_NESTED;
      break;
  }

  // initialize context
  struct Sass_Data_Context* data_ctx = sass_make_data_context(strdup(source_string));
  struct Sass_Context* ctx = sass_data_context_get_context(data_ctx);
  struct Sass_Options* ctx_opt = sass_context_get_options(ctx);

  // configure context
  sass_option_set_precision(ctx_opt, precision);
  sass_option_set_output_style(ctx_opt, sass_output_style);
  sass_option_set_source_comments(ctx_opt, source_comments);
  sass_option_set_source_map_embed(ctx_opt, source_map_embed);
  sass_option_set_source_map_contents(ctx_opt, source_map_contents);
  sass_option_set_omit_source_map_url(ctx_opt, omit_source_map_url);
  sass_option_set_is_indented_syntax_src(ctx_opt, is_indented_syntax_src);
  sass_option_set_indent(ctx_opt, indent);
  sass_option_set_linefeed(ctx_opt, linefeed);
  sass_option_set_input_path(ctx_opt, input_path);
  sass_option_set_output_path(ctx_opt, output_path);
  // void sass_option_set_plugin_path (struct Sass_Options* options, const char* plugin_path);
  sass_option_set_include_path(ctx_opt, include_paths);
  sass_option_set_source_map_file(ctx_opt, source_map_file);
  sass_option_set_source_map_root(ctx_opt, source_map_root);
  // void sass_option_set_c_functions (struct Sass_Options* options, Sass_C_Function_List c_functions);
  // void sass_option_set_importer (struct Sass_Options* options, Sass_C_Import_Callback importer);

  // compile
  int status = sass_compile_data_context(data_ctx);

  // extract results
  *included_files = NULL;
  *source_map_string = NULL;
  *error_message = NULL;
  if (status == 0) {
    output_string = strdup(sass_context_get_output_string(ctx));

    const char* _source_map_string = sass_context_get_source_map_string(ctx);
    if (_source_map_string) {
      *source_map_string = strdup(_source_map_string);
    }

    char** _included_files = sass_context_get_included_files(ctx);
    if (_included_files && *_included_files) {
      *included_files = strdup(*_included_files);
    }
  } else {
    output_string = NULL;
    *error_message = strdup(sass_context_get_error_message(ctx));
    // const char* sass_context_get_error_json (struct Sass_Context* ctx);
  }

  // clean up
  sass_delete_data_context(data_ctx);

  return output_string;
}

