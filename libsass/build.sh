#!/bin/bash

set -e -u

# USAGE:
#   build.sh <version>
#   build.sh <version> debug

# accept parameter, default to master
LIBSASS_VERSION=${1:-"master"}
echo "Building libsass version ${LIBSASS_VERSION} ${2:-}"

# clean
echo "  resetting target directory to git HEAD"
(cd ./libsass && git checkout --force ${LIBSASS_VERSION})

# patch
echo "  patching Makefile"
patch ./libsass/Makefile < ./Makefile.patch
echo "  copying emscripten_wrapper"
cp ./emscripten_wrapper.cpp ./libsass/emscripten_wrapper.cpp
cp ./emscripten_wrapper.hpp ./libsass/emscripten_wrapper.hpp
cp ./emscripten_sass_values.cpp ./libsass/emscripten_sass_values.cpp
cp ./emscripten_sass_values.hpp ./libsass/emscripten_sass_values.hpp
cp ./emscripten_sass_values.idl ./libsass/emscripten_sass_values.idl
cp ./emscripten_sass_values_glue_wrapper.cpp ./libsass/emscripten_sass_values_glue_wrapper.cpp

# build WebIDL
# (cd ./libsass && python /usr/local/Cellar/emscripten/HEAD/libexec/tools/webidl_binder.py \
#   emscripten_sass_values.idl \
#   emscripten_sass_values_glue)
# # yes, I imagine someone is going to kill me for this heresy
# echo "#include \"emscripten_sass_values.hpp\" \n #include <cstdlib> \n #include <cstring>\n $(cat libsass/emscripten_sass_values_glue.cpp)" > libsass/emscripten_sass_values_glue.cpp

# need to add imports:
#include "emscripten_sass_values.hpp"
#include <cstdlib>
#include <cstring>
#include <emscripten.h>
# need to fix all functions returning (char* EMSCRIPTEN_KEEPALIVE):
#     return self->value;
# to
#     return strdup(self->value.c_str());

# build
echo "  initializing emscripten"
if [ "${2:-}" = "debug" ]; then
  (cd libsass && emmake make js-debug)
else
  (cd libsass && emmake make js)
fi
