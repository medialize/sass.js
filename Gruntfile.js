module.exports = function(grunt) {
  'use strict';
  
  var jshintOptions = grunt.file.readJSON('.jshintrc');
  jshintOptions.reporter = require('jshint-stylish');
  
  grunt.initConfig({

    mochaTest: {
      src: ['test/**/test.*.js']
    },

    jshint: {
      options: jshintOptions,
      target: [
        'Gruntfile.js',
        'src/**/*.js',
        'test/**/*.js',
        '!src/libsass.js',
        '!src/libsass.min.js'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', 'mochaTest');
};
