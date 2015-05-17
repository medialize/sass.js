/*jshint strict:false, unused:false*/

var BooleanNumber = function(input) {
  // in emscripten you pass booleans as integer 0 and 1
  return Number(Boolean(input));
};

// map of arguments required by the emscripten wrapper (order relevant!)
// to not have to touch various different spots in this file,
// everything is defined here and registered in the appropriate places.
var options = [
  {
    // int output_style,
    type: 'number',
    // Output style for the generated css code
    // using Sass.style.*
    key: 'style',
    initial: 0,
    coerce: Number,
  },
  {
    // int precision,
    type: 'number',
    // Precision for outputting fractional numbers
    // 0: use libsass default
    key: 'precision',
    initial: -1,
    coerce: Number,
  },
  {
    // bool source_comments,
    type: 'number',
    // If you want inline source comments
    key: 'comments',
    initial: 0,
    coerce: BooleanNumber,
  },
  {
    // bool is_indented_syntax_src,
    type: 'number',
    // Treat source_string as SASS (as opposed to SCSS)
    key: 'indentedSyntax',
    initial: 0,
    coerce: BooleanNumber,
  },
  {
    // bool source_map_contents,
    type: 'number',
    // embed include contents in maps
    key: 'sourceMapContents',
    initial: 1,
    coerce: BooleanNumber,
  },
  {
    // bool source_map_embed,
    type: 'number',
    // embed sourceMappingUrl as data uri
    key: 'sourceMapEmbed',
    initial: 0,
    coerce: BooleanNumber,
  },
  {
    // bool omit_source_map_url,
    type: 'number',
    // Disable sourceMappingUrl in css output
    key: 'sourceMapOmitUrl',
    initial: 1,
    coerce: BooleanNumber,
  },
  {
    // char *source_map_root,
    type: 'string',
    // Pass-through as sourceRoot property
    key: 'sourceMapRoot',
    initial: 'root',
    coerce: String,
  },
  {
    // char *source_map_file,
    type: 'string',
    // Path to source map file
    // Enables the source map generating
    // Used to create sourceMappingUrl
    key: 'sourceMapFile',
    initial: 'file',
    coerce: String,
  },
  {
    // char *input_path,
    type: 'string',
    // The input path is used for source map generation.
    // It can be used to define something with string
    // compilation or to overload the input file path.
    // It is set to "stdin" for data contexts
    // and to the input file on file contexts.
    key: 'inputPath',
    initial: 'stdin',
    coerce: String,
  },
  {
    // char *output_path,
    type: 'string',
    // The output path is used for source map generation.
    // Libsass will not write to this file, it is just
    // used to create information in source-maps etc.
    key: 'outputPath',
    initial: 'stdout',
    coerce: String,
  },
  {
    // char *indent,
    type: 'string',
    // String to be used for indentation
    key: 'indent',
    initial: '  ',
    coerce: String,
  },
  {
    // char *linefeed,
    type: 'string',
    // String to be used to for line feeds
    key: 'linefeed',
    initial: '\n',
    coerce: String,
  },
];
