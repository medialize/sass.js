module.exports = function GruntfileShell(grunt) {
  'use strict';

  grunt.config('shell', {
    prepareLibsass: {
      command: '(cd libsass && /bin/bash ./prepare.sh "<%= libsassVersion %>")',
    },
    buildLibsass: {
      command: '(cd libsass && /bin/bash ./build.sh "<%= libsassVersion %>")',
    },
    buildLibsassDebug: {
      command: '(cd libsass && /bin/bash ./build.sh "<%= libsassVersion %>" debug)',
    },
  });

};
