module.exports = function GruntfileVersions(grunt) {
  'use strict';

  var childProcess = require('child_process');
  var fs = require('fs');

  function getGitMeta(path, done) {
    // https://github.com/damkraw/grunt-gitinfo
    var data = {
      version: null,
      commit: null,
    };

    // git rev-parse --short HEAD
    // f82a41b
    childProcess.exec('git rev-parse --short HEAD', {cwd: path}, function(err, stdout, stderr) {
      if (err) {
        grunt.log.error('obtaining git commit failed with: ' + err.code + '\n' + stderr);
        return;
      }

      data.commit = stdout.slice(0, -1);
      // git symbolic-ref HEAD
      // refs/heads/master
      childProcess.exec('git symbolic-ref HEAD', {cwd: path}, function(err, stdout /*, stderr*/) {
        if (err) {
          // git describe --tags
          // 3.2.0-beta.5-32-g0dd6543 (last tag contained)
          // 3.2.0-beta.5 (immediate tag)
          childProcess.exec('git describe --tags', {cwd: path}, function(err, stdout, stderr) {
            if (err) {
              grunt.log.error('obtaining git tag failed with: ' + err.code + '\n' + stderr);
              return;
            }

            data.version = stdout.slice(0, -1);
            done(data);
          });

          return;
        }

        data.version = stdout.replace('refs/heads/', '').slice(0, -1);
        done(data);
      });
    });
  }

  grunt.registerTask('get-emscripten-version', function() {
    var done = this.async();

    if (!grunt.config.data.versions) {
      grunt.config.data.versions = {};
    }

    var versions = grunt.config.data.versions;
    childProcess.exec('emcc --version', function(err, stdout, stderr) {
      if (err) {
        grunt.log.error('`emcc --version` failed with: ' + err.code + '\n' + stderr);
        return;
      }

      var line = stdout.split('\n')[0];
      // "emcc (Emscripten GCC-like replacement) 1.30.2 (commit dac9f88335dd74b377bedbc2ad7d3b64f0c9bb15)"
      // "emcc (Emscripten GCC-like replacement) 1.32.0 ()"
      var tokens = line.match(/emcc \([^)]+\) ([\d.]+)(?: \(commit ([^)]+)\))?/);

      versions.emscripten = {
        version: tokens[1],
        commit: tokens[2] && tokens[2].slice(0, 7) || null,
      };

      done();
    });
  });

  grunt.registerTask('get-libsass-version', function() {
    var done = this.async();

    if (!grunt.config.data.versions) {
      grunt.config.data.versions = {};
    }

    var versions = grunt.config.data.versions;
    getGitMeta('libsass/libsass/', function(data) {
      versions.libsass = data;
      done();
    });
  });

  grunt.registerTask('get-sassjs-version', function() {
    var done = this.async();

    if (!grunt.config.data.versions) {
      grunt.config.data.versions = {};
    }

    var versions = grunt.config.data.versions;
    getGitMeta('.', function(data) {
      data.branch = data.version;
      data.version = grunt.config.data.pkg.version;
      versions.sassjs = data;
      done();
    });
  });

  grunt.registerTask('save-versions', function() {
    var done = this.async();
    var _versions = JSON.stringify(grunt.config.data.versions, null, 2);
    fs.writeFile('dist/versions.json', _versions, done);
  });

  grunt.registerTask('versions', [
    'get-emscripten-version',
    'get-libsass-version',
    'get-sassjs-version',
    'mkdir:dist',
    'save-versions',
  ]);

};
