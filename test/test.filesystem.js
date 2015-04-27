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

  it.skip('should preload files', function(done) {
    done();
  });

  it.skip('should lazy load files', function(done) {
    done();
  });

});