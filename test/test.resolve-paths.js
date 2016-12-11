'use strict';

var expect = require('chai').expect;
var Sass = require('../dist/sass.sync.js');

describe('resolve-paths', function() {

  it('should provide alternatives for absolute paths', function(done) {
    // @import "/hello/world";
    var result = Sass.getPathVariations('/hello/world');
    var expected = [
      // (1) filename as given
      "/hello/world",
      // (2) underscore + given
      "/hello/_world",
      // (3) underscore + given + extension
      "/hello/_world.scss",
      "/hello/_world.sass",
      "/hello/_world.css",
      // (4) given + extension
      "/hello/world.scss",
      "/hello/world.sass",
      "/hello/world.css"
    ];

    expect(result).to.deep.equal(expected);
    done();
  });

  it('should provide alternatives for relative paths', function(done) {
    // @import "/hello/world";
    var result = Sass.getPathVariations('hello/world');
    var expected = [
      // (1) filename as given
      "hello/world",
      // (2) underscore + given
      "hello/_world",
      // (3) underscore + given + extension
      "hello/_world.scss",
      "hello/_world.sass",
      "hello/_world.css",
      // (4) given + extension
      "hello/world.scss",
      "hello/world.sass",
      "hello/world.css"
    ];

    expect(result).to.deep.equal(expected);
    done();
  });

});