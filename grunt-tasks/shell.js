module.exports = function GruntfileShell(grunt) {
  'use strict';

  grunt.config('shell', {
    prepareLibsass: {
      command: '(cd libsass && /bin/bash ./prepare.sh "<%= pkg.libsass %>")',
    },
    buildLibsass: {
      command: '(cd libsass && /bin/bash ./build.sh "<%= pkg.libsass %>")',
    },
    buildLibsassDebug: {
      command: '(cd libsass && /bin/bash ./build.sh "<%= pkg.libsass %>" debug)',
    },
  });

};
