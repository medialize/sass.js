var fs = require('fs');
var Benchmark = require('benchmark');
var nodeSass = require('node-sass');
var Sass = require('../dist/sass.sync.js');
var source = fs.readFileSync(__dirname + '/../scss/demo.scss', {encoding: 'utf8'});

var suite = new Benchmark.Suite();
// add tests
suite.add('sass.js', function(deferred) {
  Sass.compile(source, function() {
    deferred.resolve();
  });
}, {
  defer: true,
})
.add('node-sass', function(deferred) {
  nodeSass.render({
    data: source
  }, function(err, result) {
    deferred.resolve();
  });
}, {
  defer: true,
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest')[0].name);
})
// run async
.run({ 'async': true });

