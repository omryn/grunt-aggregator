'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var utils = require('../common/utils.js')(grunt);

    grunt.registerTask('list', 'makes a files list by template', function () {
        grunt.config.requires(['list', 'include']);
        grunt.config.requires(['list', 'relativeTo']);
        grunt.config.requires(['list', 'dest']);

        var options = grunt.config('list');
        options.exclude = options.exclude || [];
        options.template = options.template || '<%  print(JSON.stringify(files.map(function (fileName) {' +
                'return {' +
                'id:fileName.replace(".","_"),' +
                'url:fileName' +
                '};' +
                '}))); %>';


        var allFiles = [];

        options.include.forEach(function (file) {
            var files = grunt.file.expandFiles(file);
            files.forEach(function (fileName) {
                allFiles.push(utils.unixpath(path.relative(options.relativeTo, fileName)));
            });
        });

        options.exclude.forEach(function (file) {
            var files = grunt.file.expandFiles(file);
            files.forEach(function (fileName) {
                allFiles = grunt.utils._.without(allFiles, utils.unixpath(path.relative(options.relativeTo, fileName)));
            });
        });

        grunt.file.write(options.dest, grunt.template.process(options.template, {files:utils.cleanArray(allFiles)}));
    });
};