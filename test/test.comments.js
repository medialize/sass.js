'use strict';

var expect = require('chai').expect;
var Sass = require('../dist/sass.sync.js');

describe('option.comments', function() {

  it('should add line comments', function(done) {
    var source = '@import "testfile";\n\n$foo:123px;\n\n.m {\n  width:$foo;\n}';
    var expected = '/* line 1, sass/testfile.scss */\n.imported {\n  content: "testfile"; }\n\n/* line 5, /stdin */\n.m {\n  width: 123px; }\n';
    
    Sass.options('defaults');
    Sass.options({comments: true});

    Sass.writeFile('testfile.scss', '.imported { content: "testfile"; }');

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);

      done();
    });
  });

});