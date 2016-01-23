module.exports = function GruntfileVersions(grunt) {
  'use strict';

  var childProcess = require('child_process');
  var PATH = require('path');
  var fs = require('fs');

  function getFileSize(path, done) {
    var command = 'cp ' + path + ' ' + path + '.tmp && gzip ' + path + '.tmp';
    var cwd = PATH.join(__dirname, '..');
    var target = path + '.tmp.gz';

    childProcess.exec(command, {cwd: cwd}, function(err, stdout, stderr) {
      if (err) {
        grunt.log.error('compressing ' + path + ' failed: ' + err.code + '\n' + stderr);
        return;
      }

      fs.stat(path, function(error, inputStats) {
        if (err) {
          grunt.log.error('inspecting ' + target + ' failed: ' + err.code + '\n' + stderr);
          return;
        }

        fs.stat(target, function(error, compressedStats) {
          if (err) {
            grunt.log.error('inspecting ' + target + ' failed: ' + err.code + '\n' + stderr);
            return;
          }

          fs.unlink(target, function(error) {
            if (err) {
              grunt.log.error('removing ' + target + ' failed: ' + err.code + '\n' + stderr);
              return;
            }

            done(
              Math.round(inputStats.size / 1024) + ' KB',
              Math.round(compressedStats.size / 1024) + ' KB'
            );
          });
        });
      });
    });
  }

  grunt.registerTask('file-size', function() {
    var done = this.async();
    var sizes = {};
    getFileSize('dist/sass.js', function(normal, compressed) {
      sizes['dist/sass.js'] = {
        normal: normal,
        compressed: compressed
      };

      getFileSize('dist/sass.sync.js', function(normal, compressed) {
        sizes['dist/sass.sync.js'] = {
          normal: normal,
          compressed: compressed
        };

        getFileSize('dist/sass.worker.js', function(normal, compressed) {
          sizes['dist/sass.worker.js'] = {
            normal: normal,
            compressed: compressed
          };

          var _sizes = JSON.stringify(sizes, null, 2);
          fs.writeFile('dist/file-size.json', _sizes, done);
        });
      });
    });
  });
};