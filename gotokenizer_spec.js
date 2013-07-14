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

describe("gotokenizer.Tokenizer.readToken Imaginary Parsing", function() {
  it("0i parsed as imaginary", function() {
    expect((new gotokenizer.Tokenizer("0i")).readToken())
      .toEqual({start: 0, end: 2, type: "imaginary_lit", value: 0});
  });
  it("011i parsed as imaginary", function() {
    expect((new gotokenizer.Tokenizer("011i")).readToken())
      .toEqual({start: 0, end: 4, type: "imaginary_lit", value: 11});
  });
  it("0.i parsed as imaginary", function() {
    expect((new gotokenizer.Tokenizer("0.i")).readToken())
      .toEqual({start: 0, end: 3, type: "imaginary_lit", value: 0.0});
  });
  it("2.71828i parsed as imaginary", function() {
    expect((new gotokenizer.Tokenizer("2.71828i")).readToken())
      .toEqual({start: 0, end: 8, type: "imaginary_lit", value: 2.71828});
  });
  it("1.e+0i parsed as imaginary", function() {
    expect((new gotokenizer.Tokenizer("1.e+0i")).readToken())
      .toEqual({start: 0, end: 6, type: "imaginary_lit", value: 1.0});
  });
  it("6.67428e-11i parsed as imaginary", function() {
    expect((new gotokenizer.Tokenizer("6.67428e-11i")).readToken())
      .toEqual({start: 0, end: 12, type: "imaginary_lit", value: 6.67428e-11});
  });
  it("1E6i parsed as imaginary", function() {
    expect((new gotokenizer.Tokenizer("1E6i")).readToken())
      .toEqual({start: 0, end: 4, type: "imaginary_lit", value: 1000000});
  });
  it(".25i parsed as imaginary", function() {
    expect((new gotokenizer.Tokenizer(".25i")).readToken())
      .toEqual({start: 0, end: 4, type: "imaginary_lit", value: 0.25});
  });
  it(".12345E+5i parsed as imaginary", function() {
    expect((new gotokenizer.Tokenizer(".12345E+5i")).readToken())
      .toEqual({start: 0, end: 10, type: "imaginary_lit", value: 12345.0});
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
  it("αβ parsed as identifier", function() {
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
      it(keyword + " parsed as keyword", function() {
        expect((new gotokenizer.Tokenizer(keyword)).readToken())
          .toEqual({start: 0, end: keyword.length, type: "keyword", value: keyword});
      }); 
  }
});

describe("gotokenizer.Tokenizer.skipSpace", function() {
  it("skips multiple spaces", function() {
    var tokenizer = new gotokenizer.Tokenizer("   a");
    tokenizer.skipSpace();
    expect(tokenizer._curPos).toEqual(3);
  });
  it("skips multiple tabs", function() {
    var tokenizer = new gotokenizer.Tokenizer("\t\ta");
    tokenizer.skipSpace();
    expect(tokenizer._curPos).toEqual(2);
  });
  it("skips mixed tabs and spaces", function() {
    var tokenizer = new gotokenizer.Tokenizer("\t \t  a");
    tokenizer.skipSpace();
    expect(tokenizer._curPos).toEqual(5);
  });
  it("skips newline", function() {
    var tokenizer = new gotokenizer.Tokenizer("\na");
    tokenizer.skipSpace();
    expect(tokenizer._curPos).toEqual(1);
    expect(tokenizer._curLine).toEqual(2);
    expect(tokenizer._lineStart).toEqual(1);
  });
  it("skips multiple newline", function() {
    var tokenizer = new gotokenizer.Tokenizer("\n\n a");
    tokenizer.skipSpace();
    expect(tokenizer._curPos).toEqual(3);
    expect(tokenizer._curLine).toEqual(3);
    expect(tokenizer._lineStart).toEqual(2);
  });
  it("skips carriage return", function() {
    var tokenizer = new gotokenizer.Tokenizer("\ra");
    tokenizer.skipSpace();
    expect(tokenizer._curPos).toEqual(1);
    expect(tokenizer._curLine).toEqual(2);
    expect(tokenizer._lineStart).toEqual(1);
  });
  it("cr lf treated as one new line", function() {
    var tokenizer = new gotokenizer.Tokenizer("\r\na");
    tokenizer.skipSpace();
    expect(tokenizer._curPos).toEqual(2);
    expect(tokenizer._curLine).toEqual(2);
    expect(tokenizer._lineStart).toEqual(2);
  });
  it("lf cr treated as two new lines", function() {
    var tokenizer = new gotokenizer.Tokenizer("\n\ra");
    tokenizer.skipSpace();
    expect(tokenizer._curPos).toEqual(2);
    expect(tokenizer._curLine).toEqual(3);
    expect(tokenizer._lineStart).toEqual(2);
  });
});

describe("gotokenizer.Tokenizer.readToken skip comments", function() {
  it("skips line comment at start", function() {
    var tokenizer = new gotokenizer.Tokenizer("// comment \n");
    expect(tokenizer.readToken()).toEqual(
      {start:12, end:12, type: gotokenizer.TOK_EOF});
    expect(tokenizer._curPos).toEqual(12);
    expect(tokenizer._curLine).toEqual(2);
    expect(tokenizer._lineStart).toEqual(12);
  });
  it("skips line comment", function() {
    var tokenizer = new gotokenizer.Tokenizer("a\n// comment \n");
    tokenizer.readToken();
    expect(tokenizer._curPos).toEqual(14);
    expect(tokenizer._curLine).toEqual(3);
    expect(tokenizer._lineStart).toEqual(14);
  });
  it("skips line comment at the end of line", function() {
    var tokenizer = new gotokenizer.Tokenizer("a// comment \n");
    tokenizer.readToken();
    expect(tokenizer._curPos).toEqual(13);
    expect(tokenizer._curLine).toEqual(2);
    expect(tokenizer._lineStart).toEqual(13);
  });
  it("skips line comment at end of file", function() {
    var tokenizer = new gotokenizer.Tokenizer("// comment ");
    expect(tokenizer.readToken()).toEqual(
      {start:11, end:11, type: gotokenizer.TOK_EOF});
    expect(tokenizer._curPos).toEqual(11);
    expect(tokenizer._curLine).toEqual(1);
    expect(tokenizer._lineStart).toEqual(0);
  });
  it("skips block comment", function() {
    var tokenizer = new gotokenizer.Tokenizer("/* hello/* \nworld */");
    expect(tokenizer.readToken()).toEqual(
      {start:20, end:20, type: gotokenizer.TOK_EOF});
    expect(tokenizer._curPos).toEqual(20);
    expect(tokenizer._curLine).toEqual(2);
    expect(tokenizer._lineStart).toEqual(12);
  });
});


describe("gotokenizer.Tokenizer.readToken rune literals", function() {
  it("plain rune literals", function() {
    expect((new gotokenizer.Tokenizer("'a'")).readToken()).toEqual(
      {start: 0, end: 3, type: "rune_lit", value: "a"});
  });
  it("plain rune literals unicode 1", function() {
    expect((new gotokenizer.Tokenizer("'ä'")).readToken()).toEqual(
      {start: 0, end: 3, type: "rune_lit", value: "ä"});
  });
  it("plain rune literals unicode 2", function() {
    expect((new gotokenizer.Tokenizer("'本'")).readToken()).toEqual(
      {start: 0, end: 3, type: "rune_lit", value: "本"});
  });
  it("disallow multiple plain rune literals", function() {
    function f() {
      (new gotokenizer.Tokenizer("'aa'")).readToken();
    }
    expect(f).toThrow();
  });
  it("special rune literals", function() {
    expect((new gotokenizer.Tokenizer("'\\t'")).readToken()).toEqual(
      {start: 0, end: 4, type: "rune_lit", value: "\t"});
  });
  it("hexadecimal byte value", function() {
    expect((new gotokenizer.Tokenizer("'\\x4f'")).readToken()).toEqual(
      {start: 0, end: 6, type: "rune_lit", value: "O"});
  });
  it("disallow too few hex decimals", function() {
    function f() {
      (new gotokenizer.Tokenizer("'\\xa'")).readToken();
    }
    expect(f).toThrow();
  });
  it("little u byte value", function() {
    expect((new gotokenizer.Tokenizer("'\\u12e4'")).readToken()).toEqual(
      {start: 0, end: 8, type: "rune_lit", value: "ዤ"});
  });

  // TODO: How to support/test unicode-32?
  // '\U00101234' //legal
  // '\U00110000' // illegal: invalid Unicode code point
  // it("large U byte value", function() {
  //   expect((new gotokenizer.Tokenizer("'\\U0002F804'")).readToken()).toEqual(
  //     {start: 0, end: 12, type: "rune_lit", value: String.fromCodePoint(0x2F804)});
  // });
  it("disallow surrogate half", function() {
    function f() {
      (new gotokenizer.Tokenizer("'\\uDFFF'")).readToken()
    }
    expect(f).toThrow();
  });
});
});

// '\000'
// '\007'
// '\377'
// '\0'         // illegal: too few octal digits
