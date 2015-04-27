module.exports = function GruntfileClosureCompiler(grunt) {
  'use strict';

  grunt.config('closure-compiler', {
    worker: {
      closurePath: './bin/closure-compiler',
      js: 'dist/sass.worker.concat.js',
      jsOutputFile: 'dist/sass.worker.js',
      options: {
        /*jshint camelcase:false*/
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        language_in: 'ECMASCRIPT5'
        /*jshint camelcase:true*/
      }
    }
  });

};
