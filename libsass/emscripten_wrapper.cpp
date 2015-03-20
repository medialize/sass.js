#include <cstdlib>
#include <cstring>
#include "sass_interface.h"
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

  // sass_interface.h knows most of the answers
  struct sass_options options;
  struct sass_context *ctx = sass_new_context();

  options.source_comments = source_comments;
  options.output_style = output_style;
  options.indent = indent;
  options.linefeed = linefeed;
  options.include_paths = include_paths;
  //options.plugin_paths = plugin_paths;
  options.source_map_root = source_map_root;
  options.source_map_file = source_map_file;
  options.source_map_contents = source_map_contents;
  options.source_map_embed = source_map_embed;
  options.omit_source_map_url = omit_source_map_url;
  options.precision = precision;
  options.is_indented_syntax_src = is_indented_syntax_src;

  // libsass is taking care of memory cleanup
  ctx->source_string = strdup(source_string);
  ctx->input_path = input_path;
  ctx->output_path = output_path;
  ctx->options = options;

  sass_compile(ctx);

  if (ctx->output_string) {
    output_string = strdup(ctx->output_string);
  } else {
    output_string = NULL;
  }

  if (ctx->source_map_string) {
    *source_map_string = strdup(ctx->source_map_string);
  } else {
    *source_map_string = NULL;
  }

  if (ctx->included_files && *ctx->included_files) {
    *included_files = strdup(*ctx->included_files);
  } else {
    *included_files = NULL;
  }

  if (ctx->error_status) {
    *error_message = strdup(ctx->error_message);
  } else {
    *error_message = NULL;
  }

  sass_free_context(ctx);
  return output_string;
}

