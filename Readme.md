# Sass.js

Sass parser in JavaScript. This is a convenience API for the [emscripted](https://github.com/rodneyrehm/libsass) [libsass](https://github.com/hcatlin/libsass). If you're looking to run Sass in node, you're probably looking for [node-sass](https://github.com/andrew/node-sass)

> A fair warning: minified it's 2MB, gzipped it's 550KB. [node-sass](https://github.com/andrew/node-sass) is about [22 times faster](https://github.com/medialize/sass.js/issues/3#issuecomment-32376770) than Sass.js.

see the [live demo](http://medialize.github.com/sass.js/)

## Known Problems

* compile styles `nested`, `expanded` and `compact` seem to behave exactly the same
* compile style `compressed` prefixes every selector with `&`

(We haven't looked into why this is happening yet)


## Sass.js API

Sass.js comes in two flavors – the synchronous in-document `sass.js` and the asynchronous worker `sass.worker.js`. The primary API - wrapping the Emscripten runtime - is provided with `sass.js` (it is used internally by `sass.worker.js` as well). `sass.worker.js` mimics the same API (adding callbacks for the asynchronous part) and passes all the function calls through to the [web worker](https://developer.mozilla.org/en/docs/Web/API/Worker).


### Synchronous in-document sass.js

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

**Warning:** `src/libsass.js` will litter your global scope with Emscripten's runtime. It's great for debugging, but you really want to use `sass.worker.js`.


### Asynchronous worker sass.worker.js

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

### Working With Files

Chances are you want to use one of the readily available Sass mixins (e.g. [drublic/sass-mixins](https://github.com/drublic/Sass-Mixins) or [Burbon](https://github.com/thoughtbot/bourbon)). While Sass.js doesn't feature a full-blown "loadBurbon()", registering files is possible:

```js
Sass.writeFile('one.scss', '.one { width: 123px; }');
Sass.writeFile('some-dir/two.scss', '.two { width: 123px; }');
Sass.compile('@import "one"; @import "some-dir/two";');
```

outputs

```css
.one {
  width: 123px; }

.two {
  width: 123px; }
```

### API Overview

```js
//TODO: proper API documentation
Sass.compile(text);
Sass.options({
  style: Sass.style.nested, 
  comments: Sass.comments.none
});
Sass.writeFile(filename, text);
Sass.removeFile(filename);
Sass.readFile(filename);
Sass.listFiles();
```

---


## Authors

* [Christian Kruse](https://github.com/ckruse) - [@cjk101010](https://twitter.com/cjk101010)
* [Sebastian Golasch](https://github.com/asciidisco) - [@asciidisco](https://twitter.com/asciidisco)
* [Rodney Rehm](http://rodneyrehm.de/en/) - [@rodneyrehm](https://twitter.com/rodneyrehm)


## License

Sass.js is - as [libsass](https://github.com/hcatlin/libsass) and [Emscripten](https://github.com/kripken/emscripten/) are - published under the [MIT License](http://opensource.org/licenses/mit-license).
