define(function(require, exports, module) {

var XRegExp = require('xregexp');
var unicode = module.exports = {};
unicode.isLetter = function(char) {
    return XRegExp("^\\p{L}$").test(char);
};

return unicode;
});