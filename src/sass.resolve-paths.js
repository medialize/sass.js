/*global PATH, PATH_FS, Sass*/
/*jshint strict:false*/

function isAbsolutePath (path) {
  return path[0] === '/';
}

Sass.getPathVariations = function(path) {
  // [importer,include_path] this is where we would add the ability to
  // examine the include_path (if we ever use that in Sass.js)
  path = PATH.normalize(path);
  var directory = PATH.dirname(path);
  var basename = PATH.basename(path);
  var extensions = ['.scss', '.sass', '.css'];
  // basically what is done by resolve_and_load() in file.cpp
  // Resolution order for ambiguous imports:
  var list = [
    // (1) filename as given
    path,
    // (2) underscore + given
    PATH_FS.resolve(directory, '_' + basename)
  ].concat(extensions.map(function(extension) {
    // (3) underscore + given + extension
    return PATH_FS.resolve(directory, '_' + basename + extension);
  })).concat(extensions.map(function(extension) {
    // (4) given + extension
    return PATH_FS.resolve(directory, basename + extension);
  }));

  if (!isAbsolutePath(path)) {
    // PATH_FS.resolve() makes everything absolute, revert that
    list = list.map(function(item) {
      return isAbsolutePath(item)
        ? item.slice(1)
        : item;
    });
  }

  return list;
};

Sass.findPathVariation = function(stat, path) {
  return Sass.getPathVariations(path).reduce(function(found, path) {
    if (found) {
      return found;
    }

    try {
      stat(path);
      return path;
    } catch(e) {
      return null;
    }
  }, null);
};
