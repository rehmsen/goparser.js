require(['./goparser', 'fs'], function(goparser, fs) {

describe("goparser.Parser.parseBasicLit", function() {
  it("42 parsed as decimal integer", function() {
    var parser = new goparser.Parser("42", {trackLocations: true});
    expect(parser.parseBasicLitNode())
      .toEqual({loc: {start: {line: 1, column: 0}, end: {line: 1, column:2}}, 
                type: "int_lit", value: 42});
    expect(parser._curToken.type).toEqual(";");
  });
});

});