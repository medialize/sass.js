'use strict';

var expect = require('chai').expect;
var Sass = require('../dist/sass.sync.js');

describe('@import', function() {

  it('should read from FS', function(done) {
    var source = '@import "testfile";';
    var expected = '.imported {\n  content: "testfile"; }\n';

    Sass.options('defaults');

    Sass.writeFile('testfile.scss', '.imported { content: "testfile"; }');

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);

      done();
    });
  });

  it('should allow directories', function(done) {
    var source = '@import "some-dir/testfile";';
    var expected = '.imported {\n  content: "testfile"; }\n';

    Sass.options('defaults');

    Sass.writeFile('some-dir/testfile.scss', '.imported { content: "testfile"; }');

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);

      done();
    });
  });

  it('should resolve nested imports', function(done) {
    var source = '@import "some-dir/testfile";';
    var expected = '.imported {\n  content: "bar"; }\n\n.imported {\n  content: "testfile"; }\n';

    Sass.options('defaults');

    Sass.writeFile('some-dir/testfile.scss', '@import "foo/bar";.imported { content: "testfile"; }');
    Sass.writeFile('some-dir/foo/bar.scss', '.imported { content: "bar"; }');

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);

      done();
    });
  });

  it('should fail unknown files', function(done) {
    var source = '@import "unknown-file";';

    Sass.options('defaults');

    Sass.compile(source, function(result) {
      expect(result).to.be.a('object');
      expect(result.line).to.equal(1);
      expect(result.message).to.equal('File to import not found or unreadable: unknown-file.');

      done();
    });
  });

});
