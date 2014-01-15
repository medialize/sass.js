module.exports = function(grunt) {
  'use strict';

  var jshintOptions = grunt.file.readJSON('.jshintrc');
  jshintOptions.reporter = require('jshint-stylish');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      dist: ['dist'],
      'closure-compiler': ['dist/*.txt']
    },

    concat: {
      main: {
        src: ['src/libsass.js', 'src/sass.js'],
        dest: 'dist/sass.js',
        banner: ['/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
          '(function (root, factory) {',
          '  \'use strict\';',
          '  if (typeof define === \'function\' && define.amd) {',
          '    define([], factory);',
          '  } else if (typeof exports === \'object\') {',
          '    module.exports = factory();',
          '  } else {',
          '    root.Sass = factory();',
          '  }',
          '}(this, function () {',
          '\'use strict\';'].join('\n'),
        footer: 'return this.Sass;\n}));'
      },
      worker: {
        src: ['dist/worker.js'],
        dest: 'dist/worker.js',
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - web worker - <%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      'inline-worker': {
        src: ['dist/sass.min.js', 'dist/worker.js'],
        dest: 'dist/worker.min.js'
      }
    },

    copy: {
      worker: {
        src: 'src/libsass.worker.js',
        dest: 'dist/worker.js',
        options: {
          process: function (content) {
            return content.replace(/importScripts\('libsass\.js', 'sass\.js'\);/, 'importScripts(\'sass.min.js\');');
          }
        }
      },
      'inline-worker': {
        src: 'dist/worker.min.js',
        dest: 'dist/worker.min.js',
        options: {
          process: function (content) {
            return content.replace(/importScripts\('sass\.min\.js'\);/, '');
          }
        }
      }
    },

    'closure-compiler': {
      main: {
        closurePath: './closure-compiler',
        js: 'dist/sass.js',
        jsOutputFile: 'dist/sass.min.js',
        options: {
          /*jshint camelcase:false*/
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5'
          /*jshint camelcase:true*/
        }
      }
    },

    mochaTest: {
      src: ['test/**/test.*.js']
    },

    jshint: {
      options: jshintOptions,
      target: [
        'Gruntfile.js',
        'src/**/*.js',
        'test/**/*.js',
        '!src/libsass.js'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('build:main', ['concat:main', 'closure-compiler:main', 'clean:closure-compiler']);
  grunt.registerTask('build:worker', ['copy:worker', 'concat:worker', 'concat:inline-worker', 'copy:inline-worker']);
  grunt.registerTask('build', ['clean:dist', 'build:main', 'build:worker']);
  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', 'mochaTest');
};
