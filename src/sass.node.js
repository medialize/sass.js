var Sass = require('./sass.sync.js');
var fs = require('fs');
var path = require('path');

function fileExists(path) {
  var stat = fs.statSync(path);
  return stat && stat.isFile();
}

function importFileToSass(path, done) {
  // any path must be relative to CWD to work in both environments (real FS, and emscripten FS)
  var requestedPath = './' + path;
  // figure out the *actual* path of the file
  var filesystemPath = Sass.findPathVariation(fileExists, requestedPath);
  if (!filesystemPath) {
    done({
      error: 'File "' + requestedPath + '" not found',
    });

    return;
  }

  // write the file to emscripten FS so libsass internal FS handling
  // can engage the scss/sass switch, which apparently does not happen
  // for content provided through the importer callback directly
  var content = fs.readFileSync(filesystemPath, {encoding: 'utf8'});
  Sass.writeFile(filesystemPath, content, function() {
    done({
      path: filesystemPath,
    });
  });
}

function importerCallback(request, done) {
  importFileToSass(resolve(request), done);
}

function compileFile(path, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }

  Sass.importer(importerCallback);
  importFileToSass(path, function() {
    Sass.compileFile(path, options, callback);
  });
}

function resolve(request) {
  // the request will not have the correct "resolved" path on Windows
  // see https://github.com/medialize/sass.js/issues/69
  // see https://github.com/medialize/sass.js/issues/86
  return path.normalize(
    path.join(
      // sass.js works in the "/sass/" directory, make that relative to CWD
      path.dirname(request.previous.replace(/^\/sass\//, '')),
      request.current
    )
  ).replace(/\\/g, '/');
}

compileFile.importFileToSass = importFileToSass;
compileFile.Sass = Sass;

module.exports = compileFile;
