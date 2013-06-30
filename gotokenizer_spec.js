require.config({
    paths: {
        xregexp: "./lib/xregexp-all-min"
    }
});

require(['./gotokenizer'], function(gotokenizer) {

describe("gotokenizer suite", function() {
  it("12345 is an integer", function() {
    expect((new gotokenizer.Tokenizer("12345")).readNumberToken())
      .toEqual({start: 0, end: 5, type: "int_lit", value: 12345});
  });
});

});


