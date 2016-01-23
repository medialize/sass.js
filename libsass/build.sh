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
(cd libsass && git checkout --force ${LIBSASS_VERSION})

# patch
echo "  patching Makefile"
patch ./libsass/Makefile < ./Makefile.patch
patch ./libsass/Makefile.conf < ./Makefile.conf.patch
echo "  copying emscripten_wrapper"
cp ./emscripten_wrapper.cpp ./libsass/src/emscripten_wrapper.cpp
cp ./emscripten_wrapper.hpp ./libsass/src/emscripten_wrapper.hpp

# build
echo "  initializing emscripten"
if [ "${2:-}" = "debug" ]; then
  (cd libsass && emmake make js-debug)
else
  (cd libsass && emmake make js)
fi
