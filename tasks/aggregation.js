'use strict';

module.exports = function (grunt) {
    var path = require('path');
    var utils = require('../common/utils.js')(grunt);

    grunt.registerTask('aggregate', 'Concat, minifies and create index.json, index.debug.json', function () {
        var options = grunt.config('aggregation');

        if (this.args && this.args[0]) {
            grunt.config.requires(['aggregation', this.args[0], 'src']);
            grunt.config.requires(['aggregation', this.args[0], 'dest']);
            options = options[this.args[0]];
        } else {
            grunt.config.requires(['aggregation', 'src']);
            grunt.config.requires(['aggregation', 'dest']);
        }

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