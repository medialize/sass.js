var fs = require('fs');
var Benchmark = require('benchmark');
var nodeSass = require('node-sass');
var requirePlain = require('../test/require.plain.js');
var libSass = requirePlain({
  base: __dirname + '/../src/',
  files: ['libsass.js', 'sass.js'],
  exports: 'this.Sass'
});

var source = fs.readFileSync(__dirname + '/demo.scss');

var suite = new Benchmark.Suite();
// add tests
suite.add('sass.js', function() {
  libSass.compile(source);
})
.add('node-sass', function() {
  nodeSass.renderSync({
    data: source
  });
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run async
.run({ 'async': true });

