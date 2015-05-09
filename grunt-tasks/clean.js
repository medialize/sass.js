module.exports = function GruntfileClean(grunt) {
  'use strict';

  grunt.config('clean', {
    libsass: ['libsass/libsass'],
    dist: ['dist']
  });

};
