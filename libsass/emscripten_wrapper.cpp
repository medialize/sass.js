#include <cstdlib>
#include <cstring>
#include "sass_context.h"
#include "emscripten_wrapper.hpp"
#include <emscripten.h>

void sass_compile_emscripten(
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
  char *include_paths
) {
  // transform input
  Sass_Output_Style sass_output_style = (Sass_Output_Style)output_style;

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

  // returning data to JS via callback rather than regular function return value and C pointer fun,
  // because emscripten does not inform JavaScript when an (empterpreter) async function is done.
  // Since (char *) is a pointer (int) we can abuse EM_ASM_INT() to pass that back to JavaScript.
  // NOTE: Because we're performing tasks *after* we informed the JavaScript of success/error,
  // we need to make sure that those callbacks don't mess with the stack or prematurely
  // unblock anything vital to the still running C function
  // see https://github.com/kripken/emscripten/issues/3307#issuecomment-90999205
  if (status == 0) {
    EM_ASM_INT({
      Sass._sassCompileEmscriptenSuccess(
        pointerToString($0),
        pointerToJson($1),
        pointerToStringArray($2)
      );
    },
      sass_context_get_output_string(ctx),
      sass_context_get_source_map_string(ctx),
      sass_context_get_included_files(ctx)
    );
  } else {
    EM_ASM_INT({
      Sass._sassCompileEmscriptenError(
        pointerToJson($0),
        pointerToString($1)
      );
    },
      sass_context_get_error_json(ctx),
      sass_context_get_error_message(ctx)
    );
  }

  // clean up
  sass_delete_data_context(data_ctx);
}

