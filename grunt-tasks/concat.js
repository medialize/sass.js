module.exports = function GruntfileConcat(grunt) {
  'use strict';

  grunt.config('concat', {
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
            .replace(/importScripts\((['"])libsass.js\1,\s*\1sass.js\1\);/, '');
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
  });

};
