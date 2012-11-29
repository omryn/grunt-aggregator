module.exports = function (grunt) {
    var backSlash = /\\/g;
    var lastSlash = /\/$/;
    var path = require('path');

    var ret;
    ret = {
        unixpath:function (_path, base) {
            base = base || './';
            return path.normalize(base + "/" + _path).replace(backSlash, "/").replace(lastSlash, "");
        },

        cleanArray:function (array, base) {
            base = base || '';
            return grunt.utils._
                    .chain(array)
                    .compact()
                    .map(function (file) {
                        return ret.unixpath(file, base);
                    })
                    .uniq()
                    .value();
        }
    };

    return ret;
};
