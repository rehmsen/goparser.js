// require({paths: {xregexp: 'build/xregexp-all-min'}}, ['xregexp'], function(XRegExp) {
//     console.log(XRegExp.version);
// });

define(function(require, exports, module) {
var XRegExp = require('xregexp');
var unicode = module.exports = {};
unicode.isLetter = function(char) {
    return XRegExp("^\\p{L}$").test(char);
};

unicode.isDigit = function(char) {
    return XRegExp("^\\p{N}$").test(char);
};

return unicode;
});