define(function(require, exports, module) {
var unicode = require("unicode");
var util = require("util");
var XRegExp = require('xregexp');

var gotokenizer = module.exports = {};

gotokenizer.Location = function(line, col) {
  this.line = line;
  this.col = col;
};

var options = {
  trackLocations: true
};

gotokenizer.KEYWORDS = [
  "break", "case", "chan", "const", "continue", "default", "defer", "else",
  "fallthrough", "for", "func", "go", "goto", "if", "import", "interface", 
  "map", "package", "range", "return", "select", "struct", "switch", "type",
  "var"];

gotokenizer.ARITHMETIC_OPS = ["+", "-", "*", "/", "%"];
gotokenizer.BITWISE_OPS = ["&", "|", "^", "<<", ">>", "&^"];
gotokenizer.ASSIGNMENT_OPS = [
  "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>=", "&^=", "=", 
  ":="];
gotokenizer.LOGICAL_OPS = ["&&", "||", "!"];
gotokenizer.CHANNEL_OPS = ["<-"];
gotokenizer.INCREMENT_OPS = ["++", "--"];
gotokenizer.COMPARISON_OPS = ["==", "<", ">", "!=", "<=", ">="];
gotokenizer.VARIADIC_OPS = ["..."];
gotokenizer.BRACKETS = ["(", ")", "[", "]", "{", "}"];
gotokenizer.DELIMITERS = [",", ";", ".", ":"];

gotokenizer.TOK_EOF = {type: "eof"};

gotokenizer._HEX_REGEX = new XRegExp("[0-9a-fA-F]+");
gotokenizer._OCT_REGEX = new XRegExp("[0-7]+");
gotokenizer._DEC_REGEX = new XRegExp("[0-9]+");
gotokenizer._DIGIT_REGEX = new XRegExp("[0-9]");

gotokenizer.Tokenizer = function(input, options) {
  this._input = String(input);
  this._inputLength = this._input.length;
  
  options = options || {};
  this._trackLocations = options.trackLocations || true;

  this._tok = {};

  this._cur = "";
  this._curPos = 0;
  this._curLine = 1;
  this._lineStart = 0;  
};

gotokenizer.Tokenizer.prototype.readToken = function() {
  this._tok.start = this._curPos;
  if (this.trackLocations) {
    this._tok.startLoc = new gotokenizer.Location(
      this._curLine, 
      this._curPos - this._lineStart);
  }
  if (this._curPos > this._inputLength) {
    return this.finishToken(gotokenizer.TOK_EOF);
  }
  
  var char = this._input.charAt(this._curPos);
  
  if (this.isIdentifierStart(char)) {
    return this.readWordToken();
  }
  if (unicode.isDigit(char) || 
    char == '.' && unicode.isDigit(this.peek())) {
    return this.readNumberToken();        
  }
  switch(char) {
  }
};

gotokenizer.Tokenizer.prototype.readNumberToken = function() {
  var char = this.cur();
  var imaginary = false;

  // hex int
  if(this._input.slice(this._curPos, this._curPos+2) == "0x"){
    this._curPos++;
    char = this.next();
    var matches = XRegExp.exec(
      this._input, gotokenizer._HEX_REGEX, this._curPos, true);
    if(matches === null) {
      this.raise("Expected hex decimals but found "+this._cur());
    }
    decimals = matches[0];
    this._curPos += decimals.length;
    if(this.isIdentifierStart(this.cur()))
      this.raise(
        "Expected whitespace but found identifier right after int literal.");
    return this.finishToken("int_lit", parseInt(decimals, 16));
  }
  
  var decimals = this.readDecimals();
  
  // float
  switch(this.cur()){
  case '.': 
    char = this.next();
    this.skipDecimals();
    //purposely falling through
  case 'e': 
  case 'E': 
    char = this.cur();
    this.skipExponent();
    var tokenString = this._input.slice(this._tok.start, this._curPos);
    if(this.cur()=="i") {
      imaginary = true;
      this.next();
    }
    else if(this.isIdentifierStart(this.cur())) { 
      this.raise(
        "Expected whitespace but found identifier right after int literal.");
    }
    return this.finishToken(
      imaginary ? "imaginary_lit" : "float_lit", parseFloat(tokenString));
  }
  var base = 10;
  
  if(this.cur()=="i") {
    imaginary = true;
    this.next();
  }
  // oct
  else if(decimals[0] == '0' && decimals.length > 1) {
    this._curPos -= decimals.length-1;
    var matches = XRegExp.exec(
      this._input, gotokenizer._OCT_REGEX, this._curPos, true);
    if(matches === null) {
      this.raise("Expected oct decimals but found "+this._cur());
    }
    this._curPos += matches[0].length;
    
    
    // there were more digits, but they were not octal
    if(matches[0].length != decimals.length-1)
      this.raise(
        "Expected octal digit but found " + this.cur());
      
    decimals = matches[0];
    base = 8;
  }

  if(this.isIdentifierStart(this.cur()))
    this.raise(
      "Expected whitespace but found identifier right after int literal.");

  // oct or dec int
  return this.finishToken(
    imaginary ? "imaginary_lit" : "int_lit", parseInt(decimals, base));
};

gotokenizer.Tokenizer.prototype.skip = function() {
  this._curPos++;
};

gotokenizer.Tokenizer.prototype.next = function() {
  this._curPos++;
  return this.cur();
};

gotokenizer.Tokenizer.prototype.cur = function() {
  return this._input.charAt(this._curPos);
};

gotokenizer.Tokenizer.prototype.peek = function() {
  return this._input.charAt(this._curPos+1);
};

gotokenizer.Tokenizer.prototype.raise = function(errorMessage) {
  var errorLocation;
  if(this._trackLocations) {
    errorLocation = "Line " + this._curLine  +
      ", Column: " + (this._curPos - this._lineStart);
  }
  else {
    errorLocation = "Position " + this._cur;
  }
  throw new Error(errorLocation + ": " + errorMessage);
};

gotokenizer.Tokenizer.prototype.skipDecimals = function() {
  var char = this.cur();
  while (unicode.isDigit(char)){
    char = this.next();
  }    
};

gotokenizer.Tokenizer.prototype.readDecimals = function() {
  var startPos = this._curPos;
  this.skipDecimals();
  return this._input.slice(startPos, this._curPos);
};

gotokenizer.Tokenizer.prototype.skipExponent = function() {
  var char = this.cur();
  if (char != 'e' && char != 'E') {
    return;
  }
  char = this.next();
  if (char == '-' || char == '+') {
    char = this.next();
  }
  var startPos = this._curPos;
  this.skipDecimals();
  if (startPos == this._curPos) {
    this.raise("parseExponent: Expected decimals");
  }
};

gotokenizer.Tokenizer.prototype.readWordToken = function() {
  var word = this.readWord();
  var type = this.isKeyword(word) ? "keyword" : "identifier";
  return this.finishToken(type, word);
};

gotokenizer.Tokenizer.prototype.readWord = function() {
  var char = this._input.charAt(this._curPos);
  while(this.isIdentifierChar(char)) {
    char = this.next();
  }
  return this._input.slice(this._tok.start, this._curPos);
};

gotokenizer.Tokenizer.prototype.finishToken = function(type, value) {
  this._tok.end = this._curPos;
  if (this.trackLocations) {
    this._tok.endLoc = new gotokenizer.Location(
      this._curLine, 
      this._curPos - this._lineStart);
  }
  this._tok.type = type;
  this._tok.value = value;
  this.skipSpace();
  return this._tok;
};


gotokenizer.Tokenizer.prototype.skipSpace = function() {
  // TODO: Implement
};

gotokenizer.Tokenizer.prototype.isKeyword = util.makePredicate(gotokenizer.KEYWORDS);

gotokenizer.Tokenizer.prototype.isIdentifierStart = function(char) {
  return this.isLetter(char);
};

gotokenizer.Tokenizer.prototype.isIdentifierChar = function(char) {
  return this.isLetter(char) || gotokenizer._DIGIT_REGEX.test(char); 
};

gotokenizer.Tokenizer.prototype.isLetter = function(char) {
  return unicode.isLetter(char) || char == '_';
};
  
});
