#!/bin/bash

set -e -u

# USAGE:
#   prepare.sh <version>

# accept parameter, default to master
LIBSASS_VERSION=${1:-"master"}
echo "Preparing libsass version ${LIBSASS_VERSION}"

# clean
echo "  cleaning target directory"
rm -rf ./libsass

# download
echo "  downloading repository to target directory"
git clone https://github.com/sass/libsass.git libsass
echo "  checking out branch/tag and initializing submodules"
(cd libsass && git checkout ${LIBSASS_VERSION} && git submodule init && git submodule update)
