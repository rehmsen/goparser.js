require(['./goparser', 'fs'], function(goparser, fs) {

describe("goparser.Parser.parseOperandNode", function() {
  it("(17) parsed as int_lit", function() {
    var parser = new goparser.Parser("(17)", {trackLocations: true});
    expect(parser.parseOperandNode()).toEqual(
      {
        loc: {start: {line: 1, column: 0}, end: {line: 1, column:4}}, 
        type: "ParenExpr", 
        argument: {
          loc: {start: {line: 1, column: 1}, end: {line: 1, column:3}}, 
          type: "int_lit", 
          value: 17
        } 
      });
    expect(parser._curToken.type).toEqual(";");
  });
});

describe("goparser.Parser.parseBasicLitNode", function() {
  it("42 parsed as int_lit", function() {
    var parser = new goparser.Parser("42", {trackLocations: true});
    expect(parser.parseBasicLitNode())
      .toEqual({loc: {start: {line: 1, column: 0}, end: {line: 1, column:2}}, 
                type: "int_lit", value: 42});
    expect(parser._curToken.type).toEqual(";");
  });
});

describe("goparser.Parser.parseIdentifierOrQualifiedIdentNode", function() {
  it("Println parsed as Identifier", function() {
    var parser = new goparser.Parser("Println", {trackLocations: true});
    expect(parser.parseIdentifierOrQualifiedIdentNode())
      .toEqual({loc: {start: {line: 1, column: 0}, end: {line: 1, column:7}}, 
                type: "Identifier", name: "Println"});
    expect(parser._curToken.type).toEqual(";");
  });
  it("fmt.Println parsed as QualifiedIdent", function() {
    var parser = new goparser.Parser("fmt.Println", {trackLocations: true});
    expect(parser.parseIdentifierOrQualifiedIdentNode())
      .toEqual({loc: {start: {line: 1, column: 0}, end: {line: 1, column:11}}, 
                type: "QualifiedIdent", package: "fmt", name: "Println"});
    expect(parser._curToken.type).toEqual(";");
  });
});

describe("goparser.Parser.parseUnaryExprNode", function() {
  it("+17 parsed as UnaryExpr", function() {
    var parser = new goparser.Parser("+17", {trackLocations: true});
    expect(parser.parseUnaryExprNode()).toEqual(
        {loc: {start: {line: 1, column: 0}, end: {line: 1, column:3}}, 
          type: "UnaryExpr", 
          operator: "+", 
          argument: {
            loc: {start: {line: 1, column: 1}, end: {line: 1, column:3}},
            type: "int_lit",
            value: 17,
          },
          prefix: true
          });
    expect(parser._curToken.type).toEqual(";");
  });
  it("*&sheeps parsed as UnaryExpr", function() {
    var parser = new goparser.Parser("*&sheeps", {trackLocations: true});
    expect(parser.parseUnaryExprNode()).toEqual(
        {loc: {start: {line: 1, column: 0}, end: {line: 1, column:8}}, 
          type: "UnaryExpr", 
          operator: "*", 
          argument: {
            loc: {start: {line: 1, column: 1}, end: {line: 1, column:8}},
            type: "UnaryExpr",
            operator: "&",
            argument: {
              loc: {start: {line: 1, column: 2}, end: {line: 1, column:8}},
              type: "Identifier",
              name: "sheeps"
            },
            prefix: true,
          },
          prefix: true,
          });
    expect(parser._curToken.type).toEqual(";");
  });
});

describe("goparser.Parser.parseExpressionNode", function() {
  xit("true || !false parsed as Expression", function() {
    var parser = new goparser.Parser("true || !false", {trackLocations: true});
    expect(parser.parseExpressionNode()).toEqual(
        {loc: {start: {line: 1, column: 0}, end: {line: 1, column:14}}, 
          type: "Expression", 
          operator: "||", 
          left: {
            loc: {start: {line: 1, column: 0}, end: {line: 1, column:4}},
            type: "Identifier",
            name: "true",
          },
          right: {
            loc: {start: {line: 1, column: 8}, end: {line: 1, column:14}},
            type: "UnaryExpr",
            operator: "!",
            argument: {
              loc: {start: {line: 1, column: 9}, end: {line: 1, column:14}},
              type: "Indentifier",
              name: "false",
            },
            prefix: true
          },
          });
    expect(parser._curToken.type).toEqual(";");
  });
});


});