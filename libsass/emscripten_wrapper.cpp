#include <cstdlib>
#include <cstring>
#include "sass/context.h"
#include "emscripten_wrapper.hpp"
#include <emscripten.h>

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
) {
  // transform input
  Sass_Output_Style sass_output_style = (Sass_Output_Style)output_style;

  // initialize context
  struct Sass_Data_Context* data_ctx;
  struct Sass_File_Context* file_ctx;
  struct Sass_Context* ctx;

  if (compile_file) {
    file_ctx = sass_make_file_context(strdup(source_string));
    ctx = sass_file_context_get_context(file_ctx);
  } else {
    data_ctx = sass_make_data_context(strdup(source_string));
    ctx = sass_data_context_get_context(data_ctx);
  }

  struct Sass_Options* ctx_opt = sass_context_get_options(ctx);

  // configure context
  if (precision > -1) {
    // if we set a precision libsass will use that blindly, with
    // 0 being a valid precision - i.e. the precision of "integer"
    sass_option_set_precision(ctx_opt, precision);
  }
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

  if (custom_importer) {
    double priority = 0;
    void* cookie = 0;
    Sass_Importer_List importers = sass_make_importer_list(1);
    Sass_Importer_Entry importer = sass_make_importer(sass_importer_emscripten, priority, cookie);
    sass_importer_set_list_entry(importers, 0, importer);
    sass_option_set_c_importers(ctx_opt, importers);
  }

  // compile
  int status;
  if (compile_file) {
    status = sass_compile_file_context(file_ctx);
  } else {
    status = sass_compile_data_context(data_ctx);
  }

  // returning data to JS via callback rather than regular function return value and C pointer fun,
  // because emscripten does not inform JavaScript when an (emterpreter) async function is done.
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
  if (compile_file) {
    sass_delete_file_context(file_ctx);
  } else {
    sass_delete_data_context(data_ctx);
  }
}

Sass_Import_List sass_importer_emscripten(
  const char* cur_path,
  Sass_Importer_Entry cb,
  struct Sass_Compiler* comp
) {
  struct Sass_Import* previous = sass_compiler_get_last_import(comp);
  const char* prev_base = sass_import_get_abs_path(previous);
  // struct Sass_Context* ctx = sass_compiler_get_context(comp);
  // struct Sass_Options* opts = sass_context_get_options(ctx);

  // flag denoting if JS importer callback has completed
  bool done = false;

  // kick off the (potentially) asynchronous JS importer callback
  // NOTE: there can only be one importer running concurrently
  EM_ASM_INT({
    Importer.find(
      pointerToString($0),
      pointerToString($1)
    );
  }, cur_path, prev_base);


  // check if the JS importer callback has already finished,
  // otherwise abuse emscripten_sleep() to interrupt the
  // otherwise synchronous execution of the C function for
  // 20ms to give the (potentially) asynchronous JS importer
  // callback a chance to breathe.
  // see https://github.com/kripken/emscripten/wiki/Emterpreter#emterpreter-async-run-synchronous-code
  while (true) {
    done = (bool)EM_ASM_INT({
      return Number(Importer.finished());
    }, 0);

    if (done) {
      break;
    }

    emscripten_sleep(20);
  }

  // the JS importer callback could have reported an unrecoverable error
  char *error = (char *)EM_ASM_INT({
    return Number(Importer.error());
  }, 0);

  if (error) {
    Sass_Import_List list = sass_make_import_list(1);
    list[0] = sass_make_import_entry(cur_path, 0, 0);
    sass_import_set_error(list[0], strdup(error), 0, 0);
    return list;
  }

  // obtain path and or content provided by the JS importer callback
  char *path = (char *)EM_ASM_INT({
    return Number(Importer.path());
  }, 0);
  char *content = (char *)EM_ASM_INT({
    return Number(Importer.content());
  }, 0);

  if (content || path) {
    Sass_Import_List list = sass_make_import_list(1);
    // TODO: figure out if strdup() is really required
    list[0] = sass_make_import_entry(strdup(path ? path : cur_path), content ? strdup(content) : 0, 0);
    return list;
  }

  // JS importer callback did not find anything, nor did it report an error,
  // have the next importer (likely libsass default file loader) determine
  // how to proceed
  return NULL;
}
