module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);
  require('jit-grunt')(grunt, {
    // mappings
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    libsassVersion: '3.2.0-beta.5',
  });

  grunt.loadTasks('grunt-tasks');

  // aliases to build libsass from git using emscripten
  grunt.registerTask('libsass:prepare', ['shell:prepareLibsass']);
  grunt.registerTask('libsass:build', ['shell:buildLibsass']);
  grunt.registerTask('libsass:debug', ['shell:buildLibsassDebug']);

  // concatenate source files and libsass.js
  grunt.registerTask('build:worker', [
    'concat:worker',
    'closure-compiler:worker',
    'concat:worker-banner',
    'clean:build'
  ]);
  grunt.registerTask('build:sass', ['concat:sass']);
  grunt.registerTask('build:sync', ['concat:sync']);

  // full build pipeline
  grunt.registerTask('build', [
    'clean:dist',
    'libsass:prepare',
    'versions',
    'libsass:build',
    'build:sass',
    'build:worker',
    'build:sync'
  ]);
  grunt.registerTask('build:debug', [
    'clean:dist',
    'libsass:prepare',
    'versions',
    'libsass:debug',
    'build:sass',
    'build:worker'
  ]);

  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', 'mochaTest');
};
