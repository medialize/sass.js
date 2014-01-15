/*
 * This is an ugly hack that simply reads a couple of source files 
 * and adds `module.exports` so we can require it:
 * var requirePlain = require('require.plain');
 * var plain = requirePlain({
 *   base: 'path/to/source', // optional, prefixed to all files
 *   files: ['a.js', 'b.js'],
 *   exports: "someLocalVariable"
 * });
 */
var fs = require('fs');

var counter = 0;
var cache = {};

module.exports = function(options) {
  var key = JSON.stringify(options);
  if (cache[key]) {
    return cache[key];
  }
  
  counter++;
  var file = __dirname + '/~require.plain.' + counter + '.js';
  var base = options.base || "";
  var source = [
    '/* temporarily created from libsass.js and sass.js */'
  ];
  
  if (base.slice(base.length -1) !== '/') {
    base += '/';
  }
  
  options.files.forEach(function(file) {
    var path = base + file;
    source.push(fs.readFileSync(path));
  });
  
  source.push('module.exports = ' + options.exports + ';');
  fs.writeFileSync(file, source.join('\n'));
  cache[key] = require(file);
  fs.unlinkSync(file);
  
  return cache[key];
};
