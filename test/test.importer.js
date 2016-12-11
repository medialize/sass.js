'use strict';

var expect = require('chai').expect;
var Sass = require('../dist/sass.sync.js');
var BOM = '\uFEFF';

describe('importer', function() {

  it('should noop for no content', function(done) {
    var source = '@import "testfile";';
    var expected = '.deeptest{content:"loaded"}.testfile{content:"loaded"}\n';
    var expectedFiles = [
      '/sass/sub/deeptest.scss',
      '/sass/testfile.scss'
    ];
    var expectedBuffer = [
      {'current':'testfile', 'previous':'stdin', 'path':'/sass/testfile.scss'},
      {'current':'sub/deeptest', 'previous':'/sass/testfile.scss', 'path':'/sass/sub/deeptest.scss'}
    ];
    var buffer = [];

    Sass.clearFiles();
    Sass.importer(function(request, done) {
      buffer.push({
        current: request.current,
        previous: request.previous,
        path: request.path,
      });

      done();
    });

    Sass.options('defaults');
    Sass.options({ style: Sass.style.compressed });

    Sass.writeFile('testfile.scss', '@import "sub/deeptest";\n.testfile { content: "loaded"; }');
    Sass.writeFile('sub/deeptest.scss', '.deeptest { content: "loaded"; }');

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);
      expect(JSON.stringify(buffer)).to.equal(JSON.stringify(expectedBuffer));
      expect(JSON.stringify(result.files)).to.equal(JSON.stringify(expectedFiles));

      done();
    });
  });

  it('should rewrite paths', function(done) {
    var source = '@import "testfile";';
    var expected = '.rewritten{content:"loaded"}.testfile{content:"loaded"}\n';
    var expectedFiles = [
      '/sass/sub/rewritten.scss',
      '/sass/testfile.scss'
    ];

    Sass.clearFiles();
    Sass.importer(function(request, done) {
      var result = {};
      if (request.current === 'sub/deeptest') {
        result.path =  '/sass/sub/rewritten.scss';
      }

      done(result);
    });

    Sass.options('defaults');
    Sass.options({ style: Sass.style.compressed });

    Sass.writeFile('testfile.scss', '@import "sub/deeptest";\n.testfile { content: "loaded"; }');
    Sass.writeFile('sub/rewritten.scss', '.rewritten { content: "loaded"; }');

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);
      expect(JSON.stringify(result.files)).to.equal(JSON.stringify(expectedFiles));

      done();
    });
  });

  it('should rewrite content', function(done) {
    var source = '@import "testfile";';
    var expected = '.yolo{content:"injected"}.testfile{content:"loaded"}\n';
    var expectedFiles = [
      '/sass/sub/yolo.scss',
      '/sass/testfile.scss'
    ];

    Sass.clearFiles();
    Sass.importer(function(request, done) {
      var result = {};
      if (request.current === 'sub/deeptest') {
        result.path = '/sass/sub/yolo.scss';
        result.content = '.yolo { content: "injected"; }';
      }

      done(result);
    });

    Sass.options('defaults');
    Sass.options({ style: Sass.style.compressed });

    Sass.writeFile('testfile.scss', '@import "sub/deeptest";\n.testfile { content: "loaded"; }');
    Sass.writeFile('sub/yolo.scss', '.yolo { content: "loaded"; }');

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);
      // https://github.com/sass/libsass/issues/1040
      expect(JSON.stringify(result.files)).to.equal(JSON.stringify(expectedFiles));

      done();
    });
  });

  it('should transport errors', function(done) {
    var source = '@import "testfile";';

    Sass.clearFiles();
    Sass.importer(function(request, done) {
      var result = {};
      if (request.current === 'sub/deeptest') {
        result.error = 'nope nope nope';
      }

      done(result);
    });

    Sass.options('defaults');
    Sass.options({ style: Sass.style.compressed });

    Sass.writeFile('testfile.scss', '@import "sub/deeptest";\n.testfile { content: "loaded"; }');
    Sass.writeFile('sub/yolo.scss', '.yolo { content: "loaded"; }');

    Sass.compile(source, function(result) {
      expect(result.state).not.to.equal(0);
      expect(result.message).to.equal('nope nope nope');
      expect(result.file).to.equal('/sass/testfile.scss');
      expect(result.line).to.equal(1);
      expect(result.column).to.equal(9);

      done();
    });
  });

  it('should catch errors', function(done) {
    var source = '@import "testfile";';

    Sass.clearFiles();
    Sass.importer(function(request, done) {
      if (request.current === 'sub/deeptest') {
        throw new Error('nope nope nope');
      }

      done();
    });

    Sass.options('defaults');
    Sass.options({ style: Sass.style.compressed });

    Sass.writeFile('testfile.scss', '@import "sub/deeptest";\n.testfile { content: "loaded"; }');
    Sass.writeFile('sub/yolo.scss', '.yolo { content: "loaded"; }');

    Sass.compile(source, function(result) {
      expect(result.state).not.to.equal(0);
      expect(result.message).to.equal('nope nope nope');
      expect(result.file).to.equal('/sass/testfile.scss');
      expect(result.line).to.equal(1);
      expect(result.column).to.equal(9);

      done();
    });
  });

  it('should be async', function(done) {
    var source = '@import "testfile";';
    var expected = '.rewritten{content:"loaded"}.testfile{content:"loaded"}\n';
    var expectedFiles = [
      '/sass/sub/rewritten.scss',
      '/sass/testfile.scss'
    ];

    Sass.clearFiles();
    Sass.importer(function(request, done) {
      var result = {};
      if (request.current === 'sub/deeptest') {
        result.path =  '/sass/sub/rewritten.scss';
      }

      setTimeout(function() {
        done(result);
      }, 100);
    });

    Sass.options('defaults');
    Sass.options({ style: Sass.style.compressed });

    Sass.writeFile('testfile.scss', '@import "sub/deeptest";\n.testfile { content: "loaded"; }');
    Sass.writeFile('sub/rewritten.scss', '.rewritten { content: "loaded"; }');

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);
      expect(JSON.stringify(result.files)).to.equal(JSON.stringify(expectedFiles));

      done();
    });
  });

  it('should accept options', function(done) {
    var source = '@import "testfile";';
    var expected = '.hello{content:"world"}\n';

    Sass.importer(function(request, done) {
      done({
        content: request.options.gustav,
      });
    });

    Sass.options('defaults');
    Sass.options({ style: Sass.style.compressed });

    var options = {
      importer: {
        gustav: '.hello { content: "world" }',
      },
    };

    Sass.compile(source, options, function(result) {
      expect(result.text).to.equal(expected);
      done();
    });
  });

  it('should use correct options', function(done) {
    var source = '@import "testfile";';
    var alpha = '.alpha{content:"alpha"}\n';
    var bravo = '.bravo{content:"bravo"}\n';
    var charlie = '.charlie{content:"charlie"}\n';

    var remaining = 4;
    var _done = function() {
      remaining--;
      if (!remaining) {
        done();
      }
    };

    Sass.options('defaults');
    Sass.options({ style: Sass.style.compressed });

    Sass.importer(function(request, done) {
      done({
        content: request.options,
      });
    });

    Sass.options({ importer: '.alpha { content: "alpha"; }' });
    Sass.compile(source, function(result) {
      expect(result.text).to.equal(alpha, 'alpha');
      _done();
    });

    Sass.options({ importer: '.bravo { content: "bravo"; }' });
    Sass.compile(source, function(result) {
      expect(result.text).to.equal(bravo, 'first bravo');
      _done();
    });

    Sass.compile(source, { importer: '.charlie { content: "charlie"; }' }, function(result) {
      expect(result.text).to.equal(charlie, 'charlie');
      _done();
    });

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(bravo, 'second bravo');
      _done();
    });
  });

  it('should handle asynchronous nested imports', function(done) {
    // https://github.com/medialize/sass.js/issues/59
    var source = '.parent { @import "child"; }';
    var expected = '.parent .child{color:red}\n';
    var expectedFiles = [
      '/some/virtual/path',
    ];

    Sass.clearFiles();
    Sass.importer(function(request, done) {
      var result = {
        content: '.child { color: red; }',
        path: '/some/virtual/path',
      };

      setTimeout(function() {
        done(result);
      }, 100);
    });

    Sass.options('defaults');
    Sass.options({ style: Sass.style.compressed });

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);
      expect(JSON.stringify(result.files)).to.equal(JSON.stringify(expectedFiles));

      done();
    });
  });

  it('should compile UTF-8', function(done) {
    var source = '@import "testfile";';
    var expected = BOM + '.yolo{content:"injöcted"}.testfile{content:"löäded"}\n';
    var expectedFiles = [
      '/sass/sub/yolo.scss',
      '/sass/testfile.scss'
    ];

    Sass.clearFiles();
    Sass.importer(function(request, done) {
      var result = {};
      if (request.current === 'sub/deeptest') {
        result.path = '/sass/sub/yolo.scss';
        result.content = '// some “fun” characters\n.yolo { content: "injöcted"; }';
      }

      done(result);
    });

    Sass.options('defaults');
    Sass.options({ style: Sass.style.compressed });

    Sass.writeFile('testfile.scss', '// some “fun” characters\n@import "sub/deeptest";\n.testfile { content: "löäded"; }');
    Sass.writeFile('sub/yolo.scss', '// some “fun” characters\n.yolo { content: "löäded"; }');

    Sass.compile(source, function(result) {
      expect(result.text).to.equal(expected);
      done();
    });
  });

});
