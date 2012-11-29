'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var utils = require('../common/utils.js')(grunt);

    grunt.registerMultiTask('aggregate', 'Concat, minifies and create index.json, index.debug.json', function () {
        console.log("Aggregate data");
        console.log(JSON.stringify(this.data, null, 4));

        var options = this.data;
        var aggregations = grunt.file.readJSON(options.src);
        var min = {};
        var oldMin = grunt.config.get('min');
        var copy = {};
        var oldCopy = grunt.config.get('copy');
        var manifest = [];
        var debugManifest = [];

        var allFiles = [];

        aggregations.forEach(function (aggregation) {
            var aggregationFiles = grunt.task.helper('makelist', aggregation);

            grunt.verbose.writeln("Aggregation:");
            grunt.verbose.writeln(JSON.stringify(aggregation, null, 4));
            grunt.verbose.writeln("Files:");
            grunt.verbose.writeln(JSON.stringify(aggregationFiles, null, 4));

            allFiles.push.apply(allFiles, aggregationFiles);

            min[aggregation.dest] = {
                src: utils.cleanArray(aggregationFiles, aggregation.base),
                dest:aggregation.dest + ".min.js"
            };

            manifest.push({id:path.basename(aggregation.dest), url:aggregation.dest + ".min.js"});

            options.id = path.basename(aggregation.dest);
            options.relativeTo = utils.unixpath(aggregation.dest);
            debugManifest.push(grunt.task.helper('parselist', {
                id: path.basename(aggregation.dest),
                url:utils.unixpath(aggregation.dest)
            }, aggregationFiles));

            copy[aggregation.dest] = {files:{}};
            var files = copy[aggregation.dest].files;
            aggregationFiles.forEach(function (file) {
                var src = utils.unixpath(file, aggregation.base);
                var target = utils.unixpath(file, aggregation.dest);
                files[target] = src;
            });
        });

        grunt.config.set('min', min);
        grunt.verbose.writeln("Minifying files:");
        grunt.verbose.writeln(JSON.stringify(grunt.config.get('min'), null, 4));
        grunt.task.run('min');

        grunt.config.set('copy', copy);
        grunt.verbose.writeln("Copying files:");
        grunt.verbose.writeln(JSON.stringify(grunt.config.get('copy'), null, 4));
        grunt.task.run('copy');

//        var lintConf = grunt.config.get('lint') || {};
//        lintConf.all = lintConf.all || [];
//        lintConf.all.push.apply(lintConf.all, utils.cleanArray(allFiles));
//        grunt.config.set('lint', lintConf);
//
//        grunt.verbose.writeln("Lint files:");
//        grunt.verbose.writeln(JSON.stringify(grunt.config.get('lint'), null, 4));

        grunt.file.write(options.dest + "/manifest.json", JSON.stringify(manifest));
        grunt.file.write(options.dest + "/manifest.debug.json", "[" + debugManifest.join(",") + "]");
    });
};