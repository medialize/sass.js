module.exports = function(grunt) {
  'use strict';

  var jshintOptions = grunt.file.readJSON('.jshintrc');
  jshintOptions.reporter = require('jshint-stylish');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    libsassVersion: 'f0475ee2de8ba4c00d35cce1d4ae0280bec4e318',

    clean: {
      libsass: ['libsass/libsass'],
      dist: ['dist'],
      build: ['dist/*.txt', 'dist/sass.worker.concat.js']
    },

    concat: {
      sass: {
        src: ['src/sass.js'],
        dest: 'dist/sass.js',
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - web worker - <%= grunt.template.today("yyyy-mm-dd") %> */'
        }
      },
      worker: {
        src: ['libsass/libsass/lib/libsass.js', 'src/sass.properties.js', 'src/sass.api.js', 'src/sass.worker.js'],
        dest: 'dist/sass.worker.concat.js',
        options: {
          process: function (content) {
            return content
              // prevent emscripted libsass from exporting itself
              .replace(/module\['exports'\] = Module;/, '')
              // libsass and sass API are inlined, so no need to load them
              .replace(/importScripts\('sass\.min\.js'\);/, '');
          }
        }
      },
      sync: {
        src: ['libsass/libsass/lib/libsass.js', 'src/sass.properties.js', 'src/sass.api.js'],
        dest: 'dist/sass.sync.js',
        options: {
          banner: ['/*! <%= pkg.name %> - v<%= pkg.version %> - libsass v<%= libsassVersion %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
            '(function (root, factory) {',
            '  \'use strict\';',
            '  if (typeof define === \'function\' && define.amd) {',
            '    define([], factory);',
            '  } else if (typeof exports === \'object\') {',
            '    module.exports = factory();',
            '  } else {',
            '    root.Sass = factory();',
            '  }',
            '}(this, function () {'].join('\n'),
          footer: 'return Sass;\n}));',
          process: function (content) {
            // prevent emscripted libsass from exporting itself
            return content.replace(/module\['exports'\] = Module;/, '');
          }
        }
      },
      'worker-banner': {
        src: ['dist/sass.worker.js'],
        dest: 'dist/sass.worker.js',
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - libsass v<%= libsassVersion %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        }
      }
    },

    'closure-compiler': {
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
    },

    shell: {
      prepareLibsass: {
        command: '(cd libsass && /bin/bash ./prepare.sh "<%= libsassVersion %>")',
      },
      buildLibsass: {
        command: '(cd libsass && /bin/bash ./build.sh "<%= libsassVersion %>")',
      },
      buildLibsassDebug: {
        command: '(cd libsass && /bin/bash ./build.sh "<%= libsassVersion %>" debug)',
      },
    },

    mochaTest: {
      src: ['test/**/test.*.js']
    },

    jshint: {
      options: jshintOptions,
      target: [
        'Gruntfile.js',
        'src/**/*.js',
        'test/**/*.js'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  // aliases to build libsass from git using emscripten
  grunt.registerTask('libsass:prepare', ['shell:prepareLibsass']);
  grunt.registerTask('libsass:build', ['shell:buildLibsass']);
  grunt.registerTask('libsass:debug', ['shell:buildLibsassDebug']);

  // concatenate source files and libsass.js
  grunt.registerTask('build:worker', ['concat:worker', 'closure-compiler:worker', 'concat:worker-banner', 'clean:build']);
  grunt.registerTask('build:sass', ['concat:sass']);
  grunt.registerTask('build:sync', ['concat:sync']);

  // full build pipeline
  grunt.registerTask('build', ['clean:dist', 'libsass:prepare', 'libsass:build', 'build:sass', 'build:worker', 'build:sync']);
  grunt.registerTask('build:debug', ['clean:dist', 'libsass:prepare', 'libsass:debug', 'build:sass', 'build:worker']);

  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', 'mochaTest');
};
