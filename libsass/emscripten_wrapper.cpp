#include <cstdlib>
#include <cstring>
#include "sass_interface.h"
#include "emscripten_wrapper.hpp"

char *sass_compile_emscripten(
  char *source_string,
  int output_style,
  bool source_comments,
  char *include_paths,
  char **error_message
) {
  char *output_string;
  struct sass_options options;
  struct sass_context *ctx = sass_new_context();

  options.source_comments = source_comments;
  options.output_style = output_style;
  // options.indent = indent;
  // options.linefeed = linefeed;
  options.include_paths = include_paths;
  // options.plugin_paths = plugin_paths;

  // we're running from <stdin> without SourceMap support
  options.source_map_contents = false;
  options.source_map_embed = false;
  options.omit_source_map_url = true;
  options.precision = 0; // 0 => use sass default numeric precision
  // indented: sass, we're only dealing with scss
  options.is_indented_syntax_src = false;

  ctx->options = options;
  // libsass is taking care of memory cleanup
  ctx->source_string = strdup(source_string);

  sass_compile(ctx);

  if (ctx->output_string) {
    output_string = strdup(ctx->output_string);
  } else {
    output_string = NULL;
  }

  if (ctx->error_status) {
    *error_message = strdup(ctx->error_message);
  } else {
    *error_message = NULL;
  }

  sass_free_context(ctx);
  return output_string;
}

