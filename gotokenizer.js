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


gotokenizer._HEX_REGEX = new XRegExp("[0-9a-fA-F]+");
gotokenizer._OCT_REGEX = new XRegExp("[0-7]+");
gotokenizer._DEC_REGEX = new XRegExp("[0-9]+");
gotokenizer._DIGIT_REGEX = new XRegExp("[0-9]");

gotokenizer._EOT = String.fromCharCode(0x04);

gotokenizer.Tokenizer = function(input, options) {
  this._input = String(input);
  this._inputLength = this._input.length;
  
  options = options || {};
  this._trackLocations = options.trackLocations || true;

  this._tok = {};

  this._curPos = 0;
  this._curLine = 1;
  this._lineStart = 0;  
};

gotokenizer.Tokenizer.prototype.readToken = function() {
  var shouldInsertSemicolon = this.skipSpaceShouldInsertSemicolon();
  this._tok.start = this._curPos;
  if (this.trackLocations) {
    this._tok.startLoc = new gotokenizer.Location(
      this._curLine, 
      this._curPos - this._lineStart);
  }
  if (shouldInsertSemicolon) {
    return this.finishToken('op', ';');
  }
  if (this._curPos >= this._inputLength) {
    return this.finishToken("eof", "eof");
  }
  
  var char = this.cur();
  
  if (this.isIdentifierStart(char)) {
    return this.readWordToken();
  }
  if (gotokenizer._DIGIT_REGEX.test(char) || 
    char == '.' && gotokenizer._DIGIT_REGEX.test(this.peek())) {
    return this.readNumberToken();        
  }
  
  switch(char) {
    case "'":
      return this.readRuneToken();
    case "`":
      return this.readRawStringToken();
    case '"':
      return this.readInterpretedStringToken();
    case '+': 
      switch(this.next()) {
        case '+':
          this._curPos++;
          return this.finishToken("op", '++');
        case '=':
          this._curPos++;
          return this.finishToken("op", '+=');
        default:
          return this.finishToken("op", '+');
      }
      break;
    case '-': 
      switch(this.next()) {
        case '-':
          this._curPos++;
          return this.finishToken("op", '--');
        case '=':
          this._curPos++;
          return this.finishToken("op", '-=');
        default:
          return this.finishToken("op", '-');
      }
      break;
    case '*': 
      switch(this.next()) {
        case '=':
          this._curPos++;
          return this.finishToken("op", '*=');
        default:
          return this.finishToken("op", '*');
      }
      break;
    case '/': 
      switch(this.next()) {
        case '=':
          this._curPos++;
          return this.finishToken("op", '/=');
        default:
          return this.finishToken("op", '/');
      }
      break;
    case '%': 
      switch(this.next()) {
        case '=':
          this._curPos++;
          return this.finishToken("op", '%=');
        default:
          return this.finishToken("op", '%');
      }
      break;
    case '&': 
      switch(this.next()) {
        case '&':
          this._curPos++;
          return this.finishToken("op", '&&');
        case '=':
          this._curPos++;
          return this.finishToken("op", '&=');
        case '^':
          switch(this.next()) {
            case '=':
              this._curPos++;
              return this.finishToken("op", '&^=');
            default:
              return this.finishToken("op", '&^');
          }
          break;
        case '&':
          this._curPos++;
          return this.finishToken("op", '&&');
        default:
          return this.finishToken("op", '&');
      }
      break;
    case '|': 
      switch(this.next()) {
        case '|':
          this._curPos++;
          return this.finishToken("op", '||');
        case '=':
          this._curPos++;
          return this.finishToken("op", '|=');
        case '|':
          this._curPos++;
          return this.finishToken("op", '||');
        default:
          return this.finishToken("op", '|');
      }
      break;
    case '^': 
      switch(this.next()) {
        case '=':
          this._curPos++;
          return this.finishToken("op", '^=');
        default:
          return this.finishToken("op", '^');
      }
      break;
    case '<': 
      switch(this.next()) {
        case '<':
          switch(this.next()){
            case '=':
              this._curPos++;
              return this.finishToken("op", "<<=");
            default:
              return this.finishToken("op", "<<");   
          }
          break;
        case '=':
          this._curPos++;
          return this.finishToken("op", "<=");
        case '-':
          this._curPos++;
          return this.finishToken("op", "<-");
        default:
          return this.finishToken("op", "<");
      }
      break;
    case '>': 
      switch(this.next()) {
        case '>':
          switch(this.next()){
            case '=':
              this._curPos++;
              return this.finishToken("op", ">>=");
            default:
              return this.finishToken("op", ">>");   
          }
          break;
        case '=':
          this._curPos++;
          return this.finishToken("op", ">=");
        default:
          return this.finishToken("op", ">");
      }
      break;
    case '=': 
      switch(this.next()) {
        case '=':
          this._curPos++;
          return this.finishToken("op", "==");
        default:
          return this.finishToken("op", "=");
      }
      break;
    case ':': 
      switch(this.next()) {
        case '=':
          this._curPos++;
          return this.finishToken("op", ":=");
        default:
          return this.finishToken("op", ":");
      }
      break;
    case '!': 
      switch(this.next()) {
        case '=':
          this._curPos++;
          return this.finishToken("op", "!=");
        default:
          return this.finishToken("op", "!");
      }
      break;
    case '.': 
      switch(this.next()) {
        case '.':
          if (this.next() != '.') {
            this.raise("Expected ... but found ..");
          }
          this._curPos++;
          return this.finishToken("op", "...");
        default:
          return this.finishToken("op", ".");
      }
      break;
    case '(': 
    case ')': 
    case '[': 
    case ']': 
    case '{': 
    case '}': 
    case ';':
    case ',':
      this._curPos++;
      return this.finishToken("op", char);
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
  if (this._curPos >= this._inputLength) {
    return this._EOT;
  }
  return this._input.charAt(this._curPos);
};

gotokenizer.Tokenizer.prototype.peek = function() {
  return this._input.charAt(this._curPos+1);
};

gotokenizer.Tokenizer.prototype.startsWithAndSkip = function(s) {
  var startsWith = this._input.slice(this._curPos, this._curPos+s.length) == s;
  if (startsWith) {
    this._curPos += s.length;
  }
  return startsWith;
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
  while (gotokenizer._DIGIT_REGEX.test(char)){
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
  return this._tok;
};

gotokenizer.Tokenizer.prototype.skipSpaceShouldInsertSemicolon = function() {
  var char = this.cur();
  var changed = true;
  var firstNewline = true;
  while(this._curPos < this._inputLength && changed) {
    if (firstNewline && (char == '\r' || char == '\n')) {
      firstNewline = false;
      if (this.shouldInsertSemicolon()) {
        return true;
      }
    }
    changed = this.isNewlineAndSkip(char);
    char = this.cur();
    if (char == " " || char == "\t") {
      char = this.next();
      changed = true;
    }
    if (this.startsWithAndSkip("//")) {
      this.skipLineComment();
      changed = true;
    }
    if (this.startsWithAndSkip("/*")) {
      this.skipBlockComment();
      changed = true;
    }
  }
  return false;
};

gotokenizer.Tokenizer.prototype.logPosition = function() {
  console.log("Position: " + this._curPos + ", Char: " + this.cur());
};

gotokenizer.Tokenizer.prototype.isNewlineAndSkip = function(char) {
  var newline = false;
  if (char == "\r") {
    char = this.next();
    newline = true;
  }

  if (char == "\n") {
    this._curPos++;
    newline = true;
  }
  if (newline) {    
    this._curLine++;
    this._lineStart=this._curPos;
  }
  return newline;
};

gotokenizer.Tokenizer.prototype.shouldInsertSemicolon = function() {
  switch(this._tok.type) {
    case "int_lit":
    case "float_lit":
    case "imaginary_lit":
    case "string_lit":
    case "rune_lit":
    case "identifier":
      return true;
    case "keyword":
      switch(this._tok.value) {
        case "break":
        case "continue":
        case "fallthrough":
        case "return": 
          return true;
      }
    break;
    case "op":
      switch(this._tok.value) {
        case "++":
        case "--":
        case ")":
        case "]":
        case "}":
          return true;
      }
      break;
  } 
  return false;
};
 
gotokenizer.Tokenizer.prototype.skipLineComment = function() {
  var char = this.cur();
  while (this._curPos < this._inputLength && !this.isNewlineAndSkip(char)) {
    char = this.next();
  }
};

gotokenizer.Tokenizer.prototype.skipBlockComment = function() {
  while (!this.startsWithAndSkip("*/")) {
    if (!this.isNewlineAndSkip(this.cur())) this.next();
    if (this.cur() == this._EOT) {
      this.raise("Unexpected end of input.");
    }
  }
};

gotokenizer.Tokenizer.prototype.readRawStringToken = function() {
  var char = this.next();
  var lastIndex = this._curPos;
  var value = "";
  while (!this.startsWithAndSkip('`')) {
    if (char == this._EOT) {
      this.raise("Unexpected end of input.");
    }
    if (char == '\r') {
      value += this._input.slice(lastIndex, this._curPos);
      lastIndex = this._curPos + 1;
    }
    if (!this.isNewlineAndSkip(char)) this.next();
    char = this.cur();
  }
  value += this._input.slice(lastIndex, this._curPos-1);
  return this.finishToken("string_lit", value);
};

gotokenizer.Tokenizer.prototype.readInterpretedStringToken = function() {
  var value = "";
  this._curPos++;
  while (!this.startsWithAndSkip('"')) {
    if (this.cur() == this._EOT) {
      this.raise("Unexpected end of input.");
    }
    value += this._parseRune(true);
  }
  return this.finishToken("string_lit", value);
};

gotokenizer.Tokenizer.prototype.readRuneToken = function() {
  this._curPos++;
  var char = this._parseRune(false);
  var end = this.cur();
  if (end != "'") {
    this.raise(
      "Expected ' after rune but found " + end);
  }
  this._curPos++;
  return this.finishToken("rune_lit", char); 
};

gotokenizer.Tokenizer.prototype._parseRune = function(inString) {
  var char = this.cur();
  if (char == '\\') {
    char = this.next();
    switch(char) {
      case 'a': char = '\u0007'; break; 
      case 'b': char = '\b'; break; 
      case 'f': char = '\f'; break; 
      case 'n': char = '\n'; break; 
      case 'r': char = '\r'; break; 
      case 't': char = '\t'; break; 
      case 'v': char = '\v'; break; 
      case '\\': char = '\\'; break; 
      case '\'': 
        if (inString) this.raise("Escaping single quotes disallowed in string.");
        char = '\''; break; 
      case '"': 
        if (!inString) this.raise("Escaping double quotes disallowed in rune.");
        char = '"'; break;
      case 'x': 
      case 'u':
      case 'U':
        var numExpectedHexDigits;
        switch(char) {
          case 'x': numExpectedHexDigits = 2; break;
          case 'u': numExpectedHexDigits = 4; break;
          case 'U': numExpectedHexDigits = 8; break;
        }
        this._curPos++;
        var self = this;
        char = this._parseDigits(
          gotokenizer._HEX_REGEX, numExpectedHexDigits, 16, 0x10FFFF, 
          function (codePoint){
            if (numExpectedHexDigits<8 && unicode.isSurrogateCode(codePoint)) {
              self.raise("Half surrogates not allowed in runes.");
            }
          });

        break;
      default: 
        // octal
        char = this._parseDigits(gotokenizer._OCT_REGEX, 3, 8, 255);  
    }
  }
  this._curPos++;
  return char;
};

gotokenizer.Tokenizer.prototype._parseDigits = 
  function(regex, num, base, max, raiseIfInvalidCodePoint) {
  var matches = XRegExp.exec(
    this._input, regex, this._curPos, true);
  if(matches === null) {
    this.raise("Expected base-" + base + " digits but found "+this.cur());
  }
  if(matches[0].length != num) {
    this.raise(
      "Expected exactly " + num + " base-" + base + " digits but " +
      "found "+ matches[0]);
  }
  var codePoint = parseInt(matches[0], base);
  if (codePoint > max) {
    this.raise(
      "Expected code point in base-" + base + " below " + max +
      " but found " + codePoint);
  }
  if (raiseIfInvalidCodePoint) raiseIfInvalidCodePoint(codePoint);
  
  this._curPos += num-1;
  return String.fromCodePoint(codePoint);
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
