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
        loc: this._curToken.loc};
      this.next();
      return basicLitNode;
    default:
      return null;
  }
};

goparser.Parser.prototype.next = function() {
  this._curToken = this.tokenizer.readToken();
};


});