'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var utils = require('../common/utils.js')(grunt);

    grunt.registerHelper('makelist', function (options) {
        options.base = options.base || '.';
        options.relativeTo = options.relativeTo || options.base;
        options.exclude = options.exclude || [];
        options.include = options.include || [];

        var allFiles = [];

        options.include.forEach(function (file) {
            var files = grunt.file.expandFiles(utils.unixpath(file,options.base ));
            files.forEach(function (fileName) {
                allFiles.push(path.relative(options.relativeTo, fileName));
            });
        });

        allFiles = utils.cleanArray(allFiles);

        options.exclude.forEach(function (file) {
            var files = grunt.file.expandFiles(utils.unixpath(file,options.base ));
            files.forEach(function (fileName) {
                allFiles = grunt.utils._.without(allFiles, utils.unixpath(path.relative(options.relativeTo, fileName)));
            });
        });

        return utils.cleanArray(allFiles);
    });
};