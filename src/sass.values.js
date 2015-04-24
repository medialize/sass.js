var Values = (function(){

  function SassValueList(separator) {
    // enum Sass_Separator {
    //   SASS_COMMA,
    //   SASS_SPACE
    // };
    this.separator = !separator || separator === ',' ? ',' : ' ';
    this.values = [];
  }
  SassValueList.prototype.add = function(value) {
    if (Array.isArray(value)) {
      this.values = this.values.concat(value);
    } else {
      this.values.push(value);
    }
  };
  SassValueList.prototype.toJSON = function() {
    return {
      type: 'list',
      separator: this.separator,
      values: this.values,
    };
  };

  function SassValueMap() {
    this.values = {};
  }
  SassValueMap.prototype.add = function(value) {
    if (this.key) {
      this.values[this.key] = value;
      this.key = null;
    } else {
      this.key = value;
    }
  };
  SassValueMap.prototype.toJSON = function() {
    return {
      type: 'map',
      values: this.values,
    };
  };

  function SassValueColor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  SassValueColor.prototype.toJSON = function() {
    return {
      type: 'color',
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a,
    };
  };

  function SassValueNumber(value, unit) {
    this.value = Number(value);
    this.unit = unit || null;
  }
  SassValueNumber.prototype.toJSON = function() {
    return {
      type: 'number',
      value: this.value,
      unit: this.unit
    };
  };

  function SassValueString(value) {
    this.value = String(value);
  }
  SassValueString.prototype.toJSON = function() {
    return {
      type: 'string',
      value: this.value,
    };
  };

  function SassValueBoolean(value) {
    this.value = Boolean(value);
  }
  SassValueBoolean.prototype.toJSON = function() {
    return {
      type: 'boolean',
      value: this.value,
    };
  };

  function SassValueError(message) {
    this.message = message;
  }
  SassValueError.prototype.toJSON = function() {
    return {
      type: 'error',
      value: this.message,
    };
  };

  function SassValueWarning(message) {
    this.message = message;
  }
  SassValueWarning.prototype.toJSON = function() {
    return {
      type: 'warning',
      value: this.message,
    };
  };

  var Values = {
    _stack: [],
    _index: -1,
    reset: function() {
      Values._stack = [];
      Values._index = -1;
      Values._root = null;
    },
    collect: function() {
      var root = Values._root;
      Values.reset();
      return root;
    },
    add: function(value) {
      var frame = Values._stack[Values._index];
      if (!frame) {
        Values._root = value;
      } else {
        frame.add(value);
      }
    },
    push: function(value) {
      var frame = Values._stack[Values._index];
      if (frame) {
        frame.add(value);
      } else {
        Values._root = value;
      }

      Values._stack.push(value);
      Values._index++;
    },
    pop: function() {
      Values._stack.pop();
      Values._index--;
    },
  
    List: SassValueList,
    Map: SassValueMap,
    Color: SassValueColor,
    Number: SassValueNumber,
    String: SassValueString,
    Boolean: SassValueBoolean,
    Error: SassValueError,
    Warning: SassValueWarning,
  };

  return Values;
})();