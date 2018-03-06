module.exports = function GruntfileVersions(grunt) {
  'use strict';

  var childProcess = require('child_process');
  var PATH = require('path');
  var fs = require('fs');
  var util = require('util');
  var stat = util.promisify(fs.stat)
  var unlink = util.promisify(fs.unlink)

  function compressFile(path) {
    var command = 'cp ' + path + ' ' + path + '.tmp && gzip ' + path + '.tmp';
    var cwd = PATH.join(__dirname, '..');
    var target = path + '.tmp.gz';

    return new Promise((resolve, reject) => {
      childProcess.exec(command, {cwd: cwd}, function(err, stdout, stderr) {
        if (err) {
          grunt.log.error('compressing ' + path + ' failed: ' + err.code + '\n' + stderr);
          reject(err)
        } else {
          resolve(target)
        }
      });
    });
  }

  function removeFile(path) {
    return unlink(path).catch(error => {
      grunt.log.error('removing ' + path + ' failed: ' + error.code + '\n' + stderr);
      return Promise.reject(error)
    })
  }

  function getFileSize(path) {
    return stat(path).catch(error => {
      grunt.log.error('inspecting ' + path + ' failed: ' + error.code + '\n' + stderr);
      return Promise.reject(error)
    })
  }

  function getCompressedFileSize(path) {
    return compressFile(path).then(target => {
      return getFileSize(target).then(result => {
        return removeFile(target).then(() => result);
      });
    });
  }

  function getFileSizes(path) {
    return Promise.all([
      getFileSize(path),
      getCompressedFileSize(path),
    ]).then(([ normal, compressed ]) => {
      return {
        normal: Math.round(normal.size / 1024) + ' KB',
        compressed: Math.round(compressed.size / 1024) + ' KB',
      }
    })
  }

  grunt.registerTask('file-size', function() {
    var done = this.async();
    var files = [
      'dist/sass.js',
      'dist/sass.sync.asm.js',
      'dist/sass.sync.js',
      'dist/sass.worker.asm.js',
      'dist/sass.worker.js',
      'dist/libsass.wasm',
    ];

    var promises = files.map(path => getFileSizes(path))
    Promise.all(promises).then(results => {
      return files.reduce((result, path, index) => {
        result[path] = results[index]
        return result
      }, {})
    }).then(result => {
      var _sizes = JSON.stringify(result, null, 2);
      fs.writeFile('dist/file-size.json', _sizes, done);
    }).catch(done);
  });
};
