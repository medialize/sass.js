#include <cstdlib>
#include <cstring>
#include "sass_context.h"
#include "sass_functions.h"
#include "emscripten_wrapper.hpp"
#include "emscripten_sass_values.hpp"
#include "emscripten_sass_values_glue_wrapper.cpp"
#include <emscripten.h>
#include <emscripten/bind.h>

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
    // Sass_Importer_Entry emscripten_importer = sass_make_importer(sass_importer_emscripten, priority, cookie);
    // sass_importer_set_list_entry(importers, 0, emscripten_importer);
    importers[0] = sass_make_importer(sass_importer_emscripten, priority, cookie);
    sass_option_set_c_importers(ctx_opt, importers);
  }

  if (true) {
    void* cookie = 0;
    Sass_Function_List functions = sass_make_function_list(2);

    Sass_Function_Entry fn_foo = sass_make_function("foo()", sass_function_emscripten, cookie);
    sass_function_set_list_entry(functions, 0, fn_foo);

    Sass_Function_Entry fn_bar = sass_make_function("bar($one, $two:2)", sass_function_emscripten, cookie);
    sass_function_set_list_entry(functions, 1, fn_bar);

    sass_option_set_c_functions(ctx_opt, functions);
  }

  // compile
  int status;
  if (compile_file) {
    status = sass_compile_file_context(file_ctx);
  } else {
    status = sass_compile_data_context(data_ctx);
  }

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
  if (compile_file) {
    sass_delete_file_context(file_ctx);
  } else {
    sass_delete_data_context(data_ctx);
  }
}

struct Sass_Import** sass_importer_emscripten(
  const char* cur_path, Sass_Importer_Entry cb,
  struct Sass_Compiler* comp
) {
  struct Sass_Import* previous = sass_compiler_get_last_import(comp);
  const char* prev_base = sass_import_get_base(previous);
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
    struct Sass_Import** list = sass_make_import_list(1);
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
    struct Sass_Import** list = sass_make_import_list(1);
    // TODO: figure out if strdup() is really required
    list[0] = sass_make_import_entry(strdup(path ? path : cur_path), content ? strdup(content) : 0, 0);
    return list;
  }

  // JS importer callback did not find anything, nor did it report an error,
  // have the next importer (likely libsass default file loader) determine
  // how to proceed
  return NULL;
}

// https://github.com/sass/libsass/pull/1000
// https://github.com/sass/libsass/wiki/API-Sass-Function
// https://github.com/sass/libsass/wiki/API-Sass-Function-Example
// -----
// https://github.com/sass/libsass/wiki/API-Sass-Value
// https://github.com/sass/libsass/wiki/API-Sass-Value-Internal
// https://github.com/sass/libsass/wiki/Custom-Functions-internal
union Sass_Value* sass_function_emscripten(
  const union Sass_Value* s_args,
  Sass_Function_Entry cb,
  struct Sass_Options* opts
) {
  // https://github.com/sass/libsass/wiki/Custom-Functions-internal#signature
  //const char *signature = sass_function_get_signature(cb);
  //void *cookie = sass_function_get_cookie(cb);

  Emscripten_Sass foo = Emscripten_Sass::fromStruct(s_args);
  // http://stackoverflow.com/questions/5313322/c-cast-to-derived-class
  Emscripten_Sass_List list = *static_cast<Emscripten_Sass_List *>(&foo);
  Emscripten_Sass_Number num = *static_cast<Emscripten_Sass_Number *>(&(list.items.at(0)));
  EM_ASM_DOUBLE({
    console.log("Emscripten_Sass_Number.value", $0);
  }, num.value);

  // this is failing and I have no idea why
  union Sass_Value* nums = num.toStruct();
  EM_ASM_DOUBLE({
    console.log("sass_number_get_value()", $0);
  }, sass_number_get_value(nums));

  return nums;

  if (true) {
    // simple value
    return sass_make_number(123, "px");
  }

  if (true) {
    // number without unit?
    return sass_make_number(123, 0);
  }

  if (false) {
    // comma separated list
    Sass_Value *list = sass_make_list(2, SASS_COMMA);
    sass_list_set_value(list, 0, sass_make_number(111, "px"));
    sass_list_set_value(list, 1, sass_make_number(222, "em"));
    return list;
  }
  
  if (false) {
    // pass-through
    return (union Sass_Value*) s_args;
  }
  
  return NULL;
}
