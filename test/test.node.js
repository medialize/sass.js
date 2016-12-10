'use strict';

var fs = require('fs');

var expect = require('chai').expect;
var compile = require('../dist/sass.node.js');

var expected = fs.readFileSync('css/example.expanded.css', {encoding: 'utf8'});

describe('sass.node', function() {

  it('should compile file relative to CWD', function(done) {
    var path = 'scss/example.scss';
    var options = {
      style: compile.Sass.style.expanded,
    };

    compile.Sass.options('defaults');
    compile(path, options, function(result) {
      expect(result.text).to.equal(expected);
      done();
    });
  });

});
