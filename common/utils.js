module.exports = function (grunt) {
    var backSlash = /\\/g;
    var lastSlash = /\/$/;
    var path = require('path');

    var ret;
    ret = {
        unixpath:function (_path, base) {
            base = base || './';
            base = base.replace(backSlash,"/");
            _path = _path.replace(backSlash,"/");

            return path.join(base, _path)
                .replace(lastSlash, "")
                .replace(backSlash,"/");
        },

        cleanArray:function (array, base) {
            base = base || '';
            return grunt.utils._
                    .chain(array)
                    .compact()
                    .map(function (file) {
                        return ret.unixpath(file, base);
                    })
                    .sort()
                    .uniq()
                    .value();
        }
    };

    return ret;
};
