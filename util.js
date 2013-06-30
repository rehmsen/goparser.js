define([], function() {

var util = {};
    
// From acorn.
util.makePredicate = function(words) {
    var f = "", cats = [];
    out: for (var i = 0; i < words.length; ++i) {
      for (var j = 0; j < cats.length; ++j)
        if (cats[j][0].length == words[i].length) {
          cats[j].push(words[i]);
          continue out;
        }
      cats.push([words[i]]);
    }
    function compareTo(arr) {
      if (arr.length == 1) return f += "return str === " + JSON.stringify(arr[0]) + ";";
      f += "switch(str){";
      for (var i = 0; i < arr.length; ++i) f += "case " + JSON.stringify(arr[i]) + ":";
      f += "return true}return false;";
    }
    
    //When there are more than three length categories, an outer switch first 
    //dispatches on the lengths, to save on comparisons.
    if (cats.length > 3) {
      cats.sort(function(a, b) {return b.length - a.length;});
      f += "switch(str.length){";
      for (var k = 0; k < cats.length; ++k) {
        var cat = cats[k];
        f += "case " + cat[0].length + ":";
        compareTo(cat);
      }
      f += "}";
      
    //Otherwise, simply generate a flat switch statement.
    } else {
      compareTo(words);
    }
    return new Function("str", f);
}
return util;
});

