# Sass.js

Sass parser in JavaScript. This is a convenience API for the [emscripted](https://github.com/rodneyrehm/libsass) [libsass](https://github.com/hcatlin/libsass).

## Sass.js API

Sass.js comes in two flavors – the synchronous in-document `sass.js` and the asynchronous worker `sass.worker.js`.

## Synchronous in-document sass.js

```html
<!-- loading libsass.js and sass.js into your document -->
<script src="src/libsass.js"></script>
<script src="src/sass.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  var css = Sass.compile(scss);
  console.log(css);
</script>
```

## Asynchronous worker sass.worker.js

```html
<!-- loading libsass.worker.js and sass.worker.js into your document -->
<script src="src/sass.worker.js" data-libsass-worker="src/libsass.worker.js"></script>
<script>
  var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
  Sass.compile(scss, function(css) {
      console.log(css);
  });
</script>
```

TODO: proper API documentation

---


## Authors

* [Christian Kruse](https://github.com/ckruse) - [@cjk101010](https://twitter.com/cjk101010)
* [Sebastian Golasch](https://github.com/asciidisco) - [@asciidisco](https://twitter.com/asciidisco)
* [Rodney Rehm](http://rodneyrehm.de/en/) - [@rodneyrehm](https://twitter.com/rodneyrehm)


## License

Sass.js - as [libsass](https://github.com/hcatlin/libsass) and [Emscripten](https://github.com/kripken/emscripten/) are published under the [MIT License](http://opensource.org/licenses/mit-license).
