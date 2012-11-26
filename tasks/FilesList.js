'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var utils = require('../common/utils.js')(grunt);

    grunt.registerTask('list', 'makes a files list by template', function () {
        grunt.config.requires(['list', 'include']);
        grunt.config.requires(['list', 'dest']);

        var options = grunt.config('list');
        options.base = options.base || '.';
        options.relativeTo = options.relativeTo || options.base;
        options.exclude = options.exclude || [];
        var defaultPrinter = 'function (fileName) { return { id:fileName.replace(new RegExp("\\.","g"), "_"), url:fileName }; }';

        options.template = options.template || '<%= JSON.stringify([{url:"' + options.relativeTo +
                '", id:"' + options.base +
                '", resources: files.map(' + defaultPrinter + ')}]) %>';

        var allFiles = [];

        options.include.forEach(function (file) {
            var files = grunt.file.expandFiles(utils.unixpath(options.base + "/" + file));
            files.forEach(function (fileName) {
                allFiles.push(path.relative(options.relativeTo, fileName));
            });
        });

        allFiles = utils.cleanArray(allFiles);

        options.exclude.forEach(function (file) {
            var files = grunt.file.expandFiles(utils.unixpath(options.base + "/" + file));
            files.forEach(function (fileName) {
                allFiles = grunt.utils._.without(allFiles, utils.unixpath(path.relative(options.relativeTo, fileName)));
            });
        });

        allFiles = utils.cleanArray(allFiles);
        grunt.file.write(options.dest, grunt.template.process(options.template, {files:allFiles}));
    });
};