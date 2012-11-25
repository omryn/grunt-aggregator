/*
 * grunt-hash
 * https://github.com/jgallen23/grunt-hash
 *
 * Copyright (c) 2012 Greg Allen
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {

    // Please see the grunt documentation for more information regarding task and
    // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerTask('aggregate', 'Concat, minifies and create index.json, index.debug.json', function () {
        grunt.config.requires(['aggregation', 'src']);
        var fs = require('fs');
        var path = require('path');
        fs.existsSync = fs.existsSync || path.existsSync;

        var options = grunt.config('aggregation');
        options.dest = options.dest || '.';

        var aggregations = grunt.file.readJSON(options.src);
        var min = grunt.config.get('min') || {};
        aggregations.forEach(function (aggregation) {
            min[aggregation.dest] = {
                src:getFileNames(aggregation),
                dest:options.dest + "/" + aggregation.dest
            }
        });
        grunt.config.set('min', min);
        grunt.file.write(options.dest + "/index.json", JSON.stringify(min));


        function getFileNames(aggregation) {
            var files = [];
            aggregation.resources.forEach(function (resource) {
                var resourceFiles = grunt.file.expandFiles(aggregation.base + '/' + resource);
                // add resourceFiles to files
                files.push.apply(files, resourceFiles);
            });
            return files;
        }
    });
};