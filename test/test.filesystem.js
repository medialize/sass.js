'use strict';

var expect = require('chai').expect;
var Sass = require('../dist/sass.sync.js');

describe('filesystem', function() {

  it('should write file', function(done) {
    Sass.clearFiles();

    Sass.writeFile('hello.scss', 'content');
    expect(Sass._files['/sass/hello.scss']).to.be.a('string');
    expect(Sass.FS.stat('/sass/hello.scss')).to.be.a('object');

    Sass.writeFile('sub/hello.scss', 'content');
    expect(Sass._files['/sass/sub/hello.scss']).to.be.a('string');    
    expect(Sass.FS.stat('/sass/sub/hello.scss')).to.be.a('object');

    done();
  });

  it('should read file', function(done) {
    Sass.clearFiles();

    Sass.writeFile('hello.scss', 'my-content');
    Sass.readFile('hello.scss', function(content) {
      expect(content).to.equal('my-content');
      done();
    });

  });

  it('should remove file', function(done) {
    Sass.clearFiles();

    Sass.writeFile('hello.scss', 'my-content');
    expect(Sass._files['/sass/hello.scss']).to.be.a('string');
    expect(Sass.FS.stat('/sass/hello.scss')).to.be.a('object');

    Sass.removeFile('hello.scss');
    expect(Sass._files['/sass/hello.scss']).to.equal(undefined);
    try {
      Sass.FS.stat('/sass/hello.scss');
      expect(false).to.equal(true);
    } catch(e) {}
    
    done();
  });

  it('should list files', function(done) {
    Sass.clearFiles();

    Sass.writeFile('hello.scss', 'my-content');
    Sass.writeFile('world.scss', 'my-content');

    Sass.listFiles(function(list) {
      list.sort();
      expect(list.join(',')).to.equal('hello.scss,world.scss');
      done();
    });
  });

  it('should clear files', function(done) {
    Sass.clearFiles();

    Sass.writeFile('hello.scss', 'my-content');
    Sass.writeFile('world.scss', 'my-content');

    Sass.listFiles(function(list) {
      list.sort();
      expect(list.join(',')).to.equal('hello.scss,world.scss');
    });

    Sass.clearFiles();

    Sass.listFiles(function(list) {
      list.sort();
      expect(list.join(',')).to.equal('');
    });

    done();
  });

  it('should write multiple files', function(done) {
    Sass.clearFiles();

    Sass.writeFile({
      'first.scss': 'my-first-content',
      'sub/second.scss': 'my-second-content',
    }, function(result) {
      expect(result['first.scss']).to.equal(true);
      expect(result['sub/second.scss']).to.equal(true);

      expect(Sass._files['/sass/first.scss']).to.be.a('string');
      expect(Sass.FS.stat('/sass/first.scss')).to.be.a('object');

      expect(Sass._files['/sass/sub/second.scss']).to.be.a('string');    
      expect(Sass.FS.stat('/sass/sub/second.scss')).to.be.a('object');

      done();
    });
  });

  it('should read multiple files', function(done) {
    Sass.clearFiles();

    var files = ['first.scss', 'second.scss', 'third.scss'];
    Sass.writeFile('first.scss', 'my-first-content');
    Sass.writeFile('second.scss', 'my-second-content');
    Sass.readFile(files, function(result) {
      expect(result['first.scss']).to.equal('my-first-content');
      expect(result['second.scss']).to.equal('my-second-content');
      expect(result['third.scss']).to.equal(undefined);

      done();
    });

  });

  it('should remove multiple files', function(done) {
    Sass.clearFiles();

    var files = ['first.scss', 'second.scss', 'third.scss'];
    Sass.writeFile('first.scss', 'my-first-content');
    Sass.writeFile('second.scss', 'my-second-content');
    expect(Sass._files['/sass/first.scss']).to.be.a('string');
    expect(Sass._files['/sass/second.scss']).to.be.a('string');
    expect(Sass.FS.stat('/sass/first.scss')).to.be.a('object');
    expect(Sass.FS.stat('/sass/second.scss')).to.be.a('object');

    Sass.removeFile(files, function(result) {
      try {
        expect(result['first.scss']).to.equal(true);
        expect(result['second.scss']).to.equal(true);
        expect(result['third.scss']).to.equal(false);

        files.forEach(function(file) {
          expect(Sass._files['/sass/' + file]).to.equal(undefined);
          try {
            Sass.FS.stat('/sass/' + file);
            expect(false).to.equal(true);
          } catch(e) {}
        });
        done();
      } catch(e) {
        done(e);
      }
    });
  });

  it('should compile file', function(done) {
    Sass.clearFiles();

    Sass.writeFile({
      'hello.scss': '@import "sub/world"; .hello { content: "file"; }',
      'sub/world.scss': '.sub-world { content: "file"; }',
    });

    var expected = '.sub-world{content:"file"}.hello{content:"file"}\n';

    Sass.options('defaults');
    Sass.options({style: Sass.style.compressed});

    Sass.compileFile('hello.scss', function(result) {
      expect(result).to.be.a('object');
      expect(result.map).to.be.a('object');
      expect(result.text).to.equal(expected);

      done();
    });
  });

  it.skip('should preload files', function(done) {
    done();
  });

  it.skip('should lazy load files', function(done) {
    done();
  });

});