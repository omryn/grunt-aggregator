'use strict';

module.exports = function (grunt) {
    var path = require('path');
    var utils = require('../common/utils.js')(grunt);

    grunt.registerTask('aggregate', 'Concat, minifies and create index.json, index.debug.json', function () {
        grunt.config.requires(['aggregation', 'src', 'dest']);

        var options = grunt.config('aggregation');

        var aggregations = grunt.file.readJSON(options.src);
        var min = grunt.config.get('min') || {};
        grunt.config.set('lint', grunt.config.get('lint') || {all:[]});

        var allFiles = [];

        aggregations.forEach(function (aggregation) {
            var aggregationFiles = getFileNames(aggregation);

            allFiles.push.apply(allFiles, aggregationFiles);
            min[aggregation.dest] = {
                src:aggregationFiles,
                dest:options.dest + "/" + aggregation.dest
            };
        });
        grunt.config.set('min', min);
        grunt.config.escape('lint.all', utils.cleanArray(allFiles));
        grunt.file.write(options.dest + "/index.json", JSON.stringify(min));


        function getFileNames(aggregation) {
            var files = [];
            aggregation.resources.forEach(function (resource) {
                var resourceFiles = grunt.file.expandFiles(require('path').normalize(aggregation.base) + '/' + resource);
                resourceFiles.forEach(function (fileName) {
                    files.push(fileName);
                });
            });
            return files;
        }
    });
};