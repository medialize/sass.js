module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);
  require('jit-grunt')(grunt, {
    // mappings
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    libsassVersion: '3.2.2',
  });

  grunt.loadTasks('grunt-tasks');

  // aliases to build libsass from git using emscripten
  grunt.registerTask('libsass:prepare', ['shell:prepareLibsass']);
  grunt.registerTask('libsass:build', [
    'shell:buildLibsass',
    'mkdir:dist',
    'shell:copyLibsassMem'
  ]);
  grunt.registerTask('libsass:debug', [
    'shell:buildLibsassDebug',
    'mkdir:dist',
    'shell:copyLibsassMem'
  ]);

  // concatenate source files and libsass.js
  grunt.registerTask('build:worker', ['concat:worker']);
  grunt.registerTask('build:sass', ['concat:sass']);
  grunt.registerTask('build:sync', ['concat:sync']);

  // full build pipeline
  grunt.registerTask('build', [
    'clean:dist',
    'mkdir:dist',
    'libsass:prepare',
    'versions',
    'libsass:build',
    'build:sass',
    'build:worker',
    'build:sync'
  ]);
  grunt.registerTask('build:debug', [
    'clean:dist',
    'mkdir:dist',
    'libsass:prepare',
    'versions',
    'libsass:debug',
    'build:sass',
    'build:worker',
    'build:sync'
  ]);
  // simplifications for development
  grunt.registerTask('rebuild', [
    'versions',
    'libsass:build',
    'build:sass',
    'build:worker',
    'build:sync'
  ]);
  grunt.registerTask('rebuild:debug', [
    'versions',
    'libsass:debug',
    'build:sass',
    'build:worker',
    'build:sync'
  ]);

  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', 'mochaTest');
};
