#!/bin/bash

set -e -u

# accept parameter, default to 3.0.2
LIBSASS_VERSION=${1:-"3.0.2"}
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
(cd libsass && emmake make js)
