define(function(require, exports, module) {
var unicode = require("unicode");
var util = require("util");
var XRegExp = require('xregexp');
var gotokenizer = require('gotokenizer');

var goparser = module.exports = {};

goparser.Parser = function(input, options) {
  this.tokenizer = new gotokenizer.Tokenizer(input, options);
  this._curToken = this.tokenizer.readToken();
};

goparser.Parser.prototype.parseOperandNode = function() {
  var literalNode = this.parseLiteralNode();
  if (literalNode) return literalNode;  

  var operandNameNode = this.parseIdentifierOrQualifiedIdentNode();
  if (operandNameNode) return operandNameNode;
  
  // TODO(olrehm): MethodExpr
  // TODO(olrehm): (Expression)
  
  return null;
};

goparser.Parser.prototype.parseLiteralNode = function() {
  var basicLitNode = this.parseBasicLitNode();
  if (basicLitNode) return basicLitNode; 
  
  // TODO(olrehm): CompositeLit
  // TODO(olrehm): FunctionLit
  
  return null;
};

goparser.Parser.prototype.parseBasicLitNode = function() {
  switch(this._curToken.type) {
    case "int_lit":
    case "float_lit":
    case "imaginary_lit":
    case "rune_lit":
    case "string_lit":
      var basicLitNode = {
        type: this._curToken.type,
        value: this._curToken.value,
        loc: this._curToken.loc,
      };
      this.next();
      return basicLitNode;
    default:
      return null;
  }
};

goparser.Parser.prototype.parseIdentifierOrQualifiedIdentNode = function() {
  var identifierToken = this.accept("identifier");
  if (!identifierToken) return null;
  
  if (!this.accept(".")) {
    return {
      type: "Identifier", 
      loc: identifierToken.loc, 
      name: identifierToken.value};
  }
  var identifierToken2 = this.accept("identifier");
  return {
    type: "QualifiedIdent",
    loc: this.mergeLoc(identifierToken.loc, identifierToken2.loc),
    package: identifierToken.value,
    name: identifierToken2.value,
  };
};

goparser.Parser.prototype.parsePrimaryExprNode = function() {
  var operandNode = this.parseOperandNode();
  if (operandNode) return operandNode;

  // TODO(olrehm): Conversion
  // TODO(olrehm): BuiltinCall
  // TODO(olrehm): PrimaryExpr Selector
  // TODO(olrehm): PrimaryExpr Index
  // TODO(olrehm): PrimaryExpr Slice
  // TODO(olrehm): PrimaryExpr TypeAssertion
  // TODO(olrehm): PrimaryExpr Call
  return null;
};

goparser.Parser.prototype.parseExpressionNode = function() {
  var unaryExprNode = this.parseUnaryExprNode();
  if(unaryExprNode) return unaryExprNode;
  
  // TODO(olrehm): Expression binary_op UnaryExpr
  
  return null;
};

goparser.Parser.prototype.parseUnaryExprNode = function() {
  var primaryExprNode = this.parsePrimaryExprNode();
  if (primaryExprNode) return primaryExprNode;

  var start = this._curToken.loc.start;
  var unaryOp = this.parseUnaryOp();
  if (!unaryOp) return null;
  var unaryExprNode = this.parseUnaryExprNode();
  if (!unaryExprNode) return null;
  return {
    type: "UnaryExpr",
    loc: {start: start, end: unaryExprNode.loc.end},
    op: unaryOp,
    arg: unaryExprNode,
    isPrefix: true,
  };
};

goparser.Parser.prototype.parseUnaryOp = function() {
  switch(this._curToken.type) {
    case "+":
    case "-":
    case "!":
    case "^":
    case "*":
    case "&":
    case "<-":
      var unaryOp = this._curToken.type;
      this.next();
      return unaryOp;
    default:
      return null;
  }
};

goparser.Parser.prototype.next = function() {
  this._curToken = this.tokenizer.readToken();
};

goparser.Parser.prototype.accept = function(type) {
  if (this._curToken.type == type) {
    var acceptedToken = this._curToken;
    this.next();
    return acceptedToken;
  }
  return null;
};

goparser.Parser.prototype.mergeLoc = function(loc1, loc2) {
  return {start: loc1.start, end: loc2.end};
};




});