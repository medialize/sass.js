#!/bin/bash

set -e -u

# USAGE:
#   build-libsass.sh <version>
#   build-libsass.sh <version> debug

# accept parameter, default to master
LIBSASS_VERSION=${1:-"master"}
echo "Building libsass version ${LIBSASS_VERSION}"

# clean
rm -rf ./libsass

# download
git clone https://github.com/sass/libsass.git libsass
(cd libsass && git checkout ${LIBSASS_VERSION} && git submodule init && git submodule update)

# patch
patch ./libsass/Makefile < ./Makefile.patch
cp ./emscripten_wrapper.cpp ./libsass/emscripten_wrapper.cpp
cp ./emscripten_wrapper.hpp ./libsass/emscripten_wrapper.hpp

# build
if [ "${2:-}" = "debug" ]; then
  (cd libsass && emmake make js-debug)
else
  (cd libsass && emmake make js)
fi
