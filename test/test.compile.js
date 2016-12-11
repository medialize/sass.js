'use strict';

var expect = require('chai').expect;
var Sass = require('../dist/sass.sync.js');
var BOM = '\uFEFF';

describe('Sass.compile()', function() {

  it('should return CSS', function(done) {
    var source = '$foo:123px;\n\n.m {\n  width:$foo;\n}';
    var expected = '.m {\n  width: 123px; }\n';

    Sass.options('defaults');

    Sass.compile(source, function(result) {
      expect(result).to.be.a('object');
      expect(result.map).to.be.a('object');
      expect(result.text).to.equal(expected);

      done();
    });
  });

  it('should return parse errors', function(done) {
    var source = '$foo:123px;\n\n.m {\n  width:$foo;\n}\n\nfoobar';

    Sass.options('defaults');

    Sass.compile(source, function(result) {
      expect(result).to.be.a('object');
      expect(result.line).to.equal(7);
      expect(result.message).to.include('Invalid CSS after "foobar":');

      done();
    });
  });

  it('should accept options', function(done) {
    var source = '$foo:123.4px;\n\n.m {\n  width:$foo;\n}';
    var expected = '.m{width:123.4px}\n';
    var expected2 = '.m {\n  width: 123.4px; }\n';

    Sass.options('defaults');
    Sass.options({precision: 1});

    Sass.compile(source, {style: Sass.style.compressed}, function(result) {
      expect(result).to.be.a('object');
      expect(result.map).to.be.a('object');
      expect(result.text).to.equal(expected);

      Sass.compile(source, function(result) {
        expect(result).to.be.a('object');
        expect(result.map).to.be.a('object');
        expect(result.text).to.equal(expected2);

        done();
      });
    });
  });

  it('should fail unnkown options', function(done) {
    var source = '$foo:123.4px;\n\n.m {\n  width:$foo;\n}';

    Sass.options('defaults');
    Sass.options({precision: 1});

    Sass.compile(source, {bla: 1}, function(result) {
      expect(result).to.be.a('object');
      expect(result.status).to.equal(99);
      expect(result.message).to.equal('Unknown option "bla"');

      done();
    });
  });

  it('should queue compile() calls', function(done) {
    var source = '$foo:123px;\n\n.m {\n  width:$foo;\n}';
    var expected = '.m {\n  width: 123px; }\n';
    var _counter = 2;

    Sass.options('defaults');

    Sass.compile(source, function(result) {
      expect(result).to.be.a('object');
      expect(result.map).to.be.a('object');
      expect(result.text).to.equal(expected);

      _counter--;
      if (!_counter) {
        done();
      }
    });
    Sass.compile(source, function(result) {
      expect(result).to.be.a('object');
      expect(result.map).to.be.a('object');
      expect(result.text).to.equal(expected);

      _counter--;
      if (!_counter) {
        done();
      }
    });
  });

  it('should compile UTF-8', function(done) {
    var source = '// some “fun” characters\n$foo: "hällö würld";\n\n.m {\n  content:$foo;\n}';
    var expected = BOM + '.m{content:"hällö würld"}\n';

    Sass.options('defaults');
    Sass.options({
      style: Sass.style.compressed,
    });

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);
      done();
    });
  });

});
