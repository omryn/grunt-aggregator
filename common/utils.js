var regEx = /\\/g;
var path = require('path');
module.exports = function (grunt) {
    var ret = {
        unixpath:function (path) {
            return path.replace(regEx, "/");
        },
        cleanArray:function (array) {
            return grunt.utils._.chain(array).compact().map(path.normalize).map(ret.unixpath).uniq().value();
        }
    };

    return ret;
};
