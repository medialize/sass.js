module.exports = function GruntfileMochaTest(grunt) {
  'use strict';

  grunt.config('mochaTest', {
    src: ['test/**/test.*.js']
  });

};
