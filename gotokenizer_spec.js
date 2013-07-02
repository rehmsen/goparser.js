require.config({
    paths: {
        xregexp: "./lib/xregexp-all-min"
    }
});

require(['./gotokenizer'], function(gotokenizer) {

describe("gotokenizer suite", function() {
  it("12345 parsed as decimal integer", function() {
    expect((new gotokenizer.Tokenizer("12345")).readToken())
      .toEqual({start: 0, end: 5, type: "int_lit", value: 12345});
  });
  it("0x1F3e5 parsed as hex integer", function() {
    expect((new gotokenizer.Tokenizer("0x1F3e5")).readToken())
      .toEqual({start: 0, end: 7, type: "int_lit", value: 127973});
  });
});

});


