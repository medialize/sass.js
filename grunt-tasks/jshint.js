module.exports = function GruntfileShell(grunt) {
  'use strict';

  var jshintOptions = grunt.file.readJSON('.jshintrc');
  jshintOptions.reporter = require('jshint-stylish');

  grunt.config('jshint', {
    options: jshintOptions,
    target: [
      'Gruntfile.js',
      'grunt-tasks/**/*.js',
      'src/**/*.js',
      'test/**/*.js'
    ]
  });

};
