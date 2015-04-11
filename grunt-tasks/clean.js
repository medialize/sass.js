module.exports = function GruntfileClean(grunt) {
  'use strict';

  grunt.config('clean', {
    libsass: ['libsass/libsass'],
    dist: ['dist'],
    build: ['dist/*.txt', 'dist/sass.worker.concat.js']
  });

};
