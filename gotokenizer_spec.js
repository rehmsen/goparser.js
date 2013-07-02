require.config({
    paths: {
        xregexp: "./lib/xregexp-all-min"
    }
});

require(['./gotokenizer'], function(gotokenizer) {

describe("gotokenizer.Tokenizer.readToken Int Parsing", function() {
  it("42 parsed as decimal integer", function() {
    expect((new gotokenizer.Tokenizer("42")).readToken())
      .toEqual({start: 0, end: 2, type: "int_lit", value: 42});
  });
  it("0600 parsed as octal integer", function() {
    expect((new gotokenizer.Tokenizer("0600")).readToken())
      .toEqual({start: 0, end: 4, type: "int_lit", value: 384});
  });
  it("0xBadFace parsed as hex integer", function() {
    expect((new gotokenizer.Tokenizer("0xBadFace")).readToken())
      .toEqual({start: 0, end: 9, type: "int_lit", value: 195951310});
  });
  it("170141183460469231731687303715884105727 parsed as dec integer", 
     function() {
    expect((new gotokenizer.Tokenizer(
        "170141183460469231731687303715884105727")).readToken())
      .toEqual({start: 0, end: 39, type: "int_lit", 
                value: 170141183460469231731687303715884105727});
  });
  it("0x25gf should fail", function() {
    function f() {
      return (new gotokenizer.Tokenizer("0x25gf")).readToken();
    }
    expect(f).toThrow();
  });
  it("02598 should fail", function() {
    function f() {
      return (new gotokenizer.Tokenizer("02598")).readToken();
    }
    expect(f).toThrow();
  });
  it("26fd3 should fail", function() {
    function f() {
      return (new gotokenizer.Tokenizer("26fd3")).readToken();
    }
    expect(f).toThrow();
  });  
  it("0.1ee should fail", function() {
    function f() {
      return (new gotokenizer.Tokenizer("0.1ee")).readToken();
    }
    expect(f).toThrow();
  });  
  it("0.1f should fail", function() {
    function f() {
      return (new gotokenizer.Tokenizer("0.1f")).readToken();
    }
    expect(f).toThrow();
  });  
});

describe("gotokenizer.Tokenizer.readToken Float Parsing", function() {
  it("0. parsed as float", function() {
    expect((new gotokenizer.Tokenizer("0.")).readToken())
      .toEqual({start: 0, end: 2, type: "float_lit", value: 0.0});
  });
  it("72.40 parsed as float", function() {
    expect((new gotokenizer.Tokenizer("72.40")).readToken())
      .toEqual({start: 0, end: 5, type: "float_lit", value: 72.4});
  });
  it("072.40 parsed as float", function() {
    expect((new gotokenizer.Tokenizer("072.40")).readToken())
      .toEqual({start: 0, end: 6, type: "float_lit", value: 72.4});
  });
  it("2.71828 parsed as float", function() {
    expect((new gotokenizer.Tokenizer("2.71828")).readToken())
      .toEqual({start: 0, end: 7, type: "float_lit", value: 2.71828});
  });
  it("1.e+0 parsed as float", function() {
    expect((new gotokenizer.Tokenizer("1.e+0")).readToken())
      .toEqual({start: 0, end: 5, type: "float_lit", value: 1.0});
  });
  it("6.67428e-11 parsed as float", function() {
    expect((new gotokenizer.Tokenizer("6.67428e-11")).readToken())
      .toEqual({start: 0, end: 11, type: "float_lit", value: 6.67428e-11});
  });
  it("1E6 parsed as float", function() {
    expect((new gotokenizer.Tokenizer("1E6")).readToken())
      .toEqual({start: 0, end: 3, type: "float_lit", value: 1000000.0});
  });
  it(".25 parsed as float", function() {
    expect((new gotokenizer.Tokenizer(".25")).readToken())
      .toEqual({start: 0, end: 3, type: "float_lit", value: 0.25});
  });
  it("2.71828 parsed as float", function() {
    expect((new gotokenizer.Tokenizer(
        ".12345e+5")).readToken())
      .toEqual({start: 0, end: 9, type: "float_lit", value: 12345.0});
  });
});

describe("gotokenizer.Tokenizer.readToken Identifier Parsing", function() {
  it("a parsed as identifier", function() {
    expect((new gotokenizer.Tokenizer("a")).readToken())
      .toEqual({start: 0, end: 1, type: "identifier", value: "a"});
  });
  it("_x9 parsed as identifier", function() {
    expect((new gotokenizer.Tokenizer("_x9")).readToken())
      .toEqual({start: 0, end: 3, type: "identifier", value: "_x9"});
  });
  it("ThisVariableIsExported parsed as identifier", function() {
    expect((new gotokenizer.Tokenizer("ThisVariableIsExported")).readToken())
      .toEqual({
          start: 0, end: 22, type: "identifier", 
          value: "ThisVariableIsExported"});
  });
  it("αβ parsed as float", function() {
    expect((new gotokenizer.Tokenizer("αβ")).readToken())
      .toEqual({start: 0, end: 2, type: "identifier", value: "αβ"});
  });
});

describe("gotokenizer.Tokenizer.readToken Keyword Parsing", function() {
  var keywords = [
      "break", "case", "chan", "const", "continue", "default", "defer", "else",
      "fallthrough", "for", "func", "go", "goto", "if", "import", "interface", 
      "map", "package", "range", "return", "select", "struct", "switch", "type",
      "var"];
  var keywordsLength = keywords.length;  
  for(var i=0; i<keywordsLength; i++) {
      var keyword = keywords[i];
      it(keyword + " parsed as identifier", function() {
        expect((new gotokenizer.Tokenizer(keyword)).readToken())
          .toEqual({start: 0, end: keyword.length, type: "keyword", value: keyword});
      });
      
  }
});


});


