module.exports = function GruntfileMkdir(grunt) {
  'use strict';

  grunt.config('mkdir', {
    dist: {
      options: {
        create: ['dist']
      }
    }
  });

};
