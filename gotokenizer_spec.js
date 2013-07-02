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
  it("0x25gf should stop parsing at g", function() {
    var tokenizer = new gotokenizer.Tokenizer("0x25gf");
    expect(tokenizer.readToken()).toEqual(
        {start: 0, end: 4, type: "int_lit", value: 37});
    expect(tokenizer._curPos).toEqual(4);
  });
  it("02598 should stop parsing at 9", function() {
    var tokenizer = new gotokenizer.Tokenizer("02598");
    expect(tokenizer.readToken()).toEqual(
        {start: 0, end: 3, type: "int_lit", value: 21});
    expect(tokenizer._curPos).toEqual(3);
  });
  it("26fd3 should stop parsing at f", function() {
    var tokenizer = new gotokenizer.Tokenizer("26fd3");
    expect(tokenizer.readToken()).toEqual(
        {start: 0, end: 2, type: "int_lit", value: 26});
    expect(tokenizer._curPos).toEqual(2);
  });  
});

});


