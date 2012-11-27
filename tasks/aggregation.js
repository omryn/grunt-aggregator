'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var utils = require('../common/utils.js')(grunt);

    function getOptions(args) {
        var options = grunt.config('aggregate');
        if (args && args[0]) {
            grunt.config.requires(['aggregate', args[0], 'src']);
            grunt.config.requires(['aggregate', args[0], 'dest']);
            options = options[args[0]];
        } else {
            grunt.config.requires(['aggregate', 'src']);
            grunt.config.requires(['aggregate', 'dest']);
        }
        return options;
    }

    grunt.registerTask('aggregate', 'Concat, minifies and create index.json, index.debug.json', function () {
        var options = getOptions(this.args);

        var aggregations = grunt.file.readJSON(options.src);
        var min = grunt.config.get('min') || {};

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
        grunt.verbose.writeln("Min files:");
        grunt.verbose.writeln(JSON.stringify(grunt.config.get('min'), null, 4));


        var lintConf = grunt.config.get('lint') || {};
        lintConf.all = lintConf.all || [];
        lintConf.all.push.apply(lintConf.all, utils.cleanArray(allFiles));
        grunt.config.set('lint', lintConf);

        grunt.verbose.writeln("Lint files:");
        grunt.verbose.writeln(JSON.stringify(grunt.config.get('lint'), null, 4));

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