module.exports = function GruntfileConcat(grunt) {
  'use strict';

  /*jshint laxbreak:true */
  var banner = '/*! <%= pkg.name %> - v<%= pkg.version %> (<%= versions.sassjs.commit %>) - built <%= grunt.template.today("yyyy-mm-dd") %>\n'
    + '  providing libsass <%= versions.libsass.version %> (<%= versions.libsass.commit %>)\n'
    + '  via emscripten <%= versions.emscripten.version %> (<%= versions.emscripten.commit %>)\n */\n';
  var umdHeader = ['(function (root, factory) {',
    '  \'use strict\';',
    '  if (typeof define === \'function\' && define.amd) {',
    '    define([], factory);',
    '  } else if (typeof exports === \'object\') {',
    '    module.exports = factory();',
    '  } else {',
    '    root.Sass = factory();',
    '  }',
    '}(this, function () {'].join('\n');
  var umdFooter = 'return Sass;\n}));';
  /*jshint laxbreak:false */

  grunt.config('concat', {
    sass: {
      dest: 'dist/sass.js',
      src: [
        'src/sass.configure.path.js',
        'src/sass.js'
      ],
      options: {
        banner: banner + '\n' + umdHeader,
        footer: umdFooter,
      }
    },
    worker: {
      dest: 'dist/sass.worker.js',
      src: [
        'libsass/libsass/lib/libsass.js',
        'src/sass.util.js',
        'src/sass.options.js',
        'src/sass.importer.js',
        'src/sass.api.js',
        'src/sass.resolve-paths.js',
        'src/sass.worker.js'
      ],
      options: {
        banner: banner,
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
      dest: 'dist/sass.sync.js',
      src: [
        'src/sass.configure.path.js',
        'libsass/libsass/lib/libsass.js',
        'src/sass.util.js',
        'src/sass.options.js',
        'src/sass.importer.js',
        'src/sass.api.js',
        'src/sass.resolve-paths.js'
      ],
      options: {
        banner: banner + '\n' + umdHeader,
        footer: umdFooter,
        process: function (content) {
          // prevent emscripted libsass from exporting itself
          return content.replace(/module\['exports'\] = Module;/, '');
        }
      }
    },
    node: {
      dest: 'dist/sass.node.js',
      src: [
        'src/sass.node.js',
      ],
      options: {
        banner: banner,
      },
    },
  });

};
