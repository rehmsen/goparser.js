require(['./goparser', 'fs'], function(goparser, fs) {

describe("goparser.Parser.parseBasicLitNode", function() {
  it("42 parsed as int_lit", function() {
    var parser = new goparser.Parser("42", {trackLocations: true});
    expect(parser.parseBasicLitNode())
      .toEqual({loc: {start: {line: 1, column: 0}, end: {line: 1, column:2}}, 
                type: "int_lit", value: 42});
    expect(parser._curToken.type).toEqual(";");
  });
});

describe("goparser.Parser.parseOperandNameNode", function() {
  it("Println parsed as Identifier", function() {
    var parser = new goparser.Parser("Println", {trackLocations: true});
    expect(parser.parseOperandNameNode())
      .toEqual({loc: {start: {line: 1, column: 0}, end: {line: 1, column:7}}, 
                type: "Identifier", name: "Println"});
    expect(parser._curToken.type).toEqual(";");
  });
  it("fmt.Println parsed as QualifiedIdentifier", function() {
    var parser = new goparser.Parser("fmt.Println", {trackLocations: true});
    expect(parser.parseOperandNameNode())
      .toEqual({loc: {start: {line: 1, column: 0}, end: {line: 1, column:11}}, 
                type: "QualifiedIdentifier", package: "fmt", name: "Println"});
    expect(parser._curToken.type).toEqual(";");
  });
});


});