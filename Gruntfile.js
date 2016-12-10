module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);
  require('jit-grunt')(grunt, {
    // mappings
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
  });

  grunt.loadTasks('grunt-tasks');

  // aliases to build libsass from git using emscripten
  grunt.registerTask('libsass:prepare', ['shell:prepareLibsass']);
  grunt.registerTask('libsass:build', [
    'shell:buildLibsass',
    'mkdir:dist',
  ]);
  grunt.registerTask('libsass:debug', [
    'shell:buildLibsassDebug',
    'mkdir:dist',
  ]);

  // concatenate source files and libsass.js
  grunt.registerTask('build:worker', ['concat:worker']);
  grunt.registerTask('build:sass', ['concat:sass']);
  grunt.registerTask('build:sync', ['concat:sync']);
  grunt.registerTask('build:node', ['concat:node']);

  // full build pipeline
  grunt.registerTask('build', [
    'clean:dist',
    'mkdir:dist',
    'libsass:prepare',
    'versions',
    'libsass:build',
    'build:sass',
    'build:worker',
    'build:sync',
    'build:node',
    'file-size',
  ]);
  grunt.registerTask('build:debug', [
    'clean:dist',
    'mkdir:dist',
    'libsass:prepare',
    'versions',
    'libsass:debug',
    'build:sass',
    'build:worker',
    'build:sync',
    'build:node',
    'file-size',
  ]);
  // simplifications for development
  grunt.registerTask('rebuild', [
    'versions',
    'libsass:build',
    'build:sass',
    'build:worker',
    'build:sync',
    'build:node',
    'file-size',
  ]);
  grunt.registerTask('rebuild:debug', [
    'versions',
    'libsass:debug',
    'build:sass',
    'build:worker',
    'build:sync',
    'build:node',
    'file-size',
  ]);

  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', 'mochaTest');
};
