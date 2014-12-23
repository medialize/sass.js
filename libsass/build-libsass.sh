#!/bin/bash

set -e -u

LIBSASS_VERSION="3.0.2"

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
