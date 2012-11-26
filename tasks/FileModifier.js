'use strict';
module.exports = function (grunt) {
    var utils = require('../common/utils.js')(grunt);

    grunt.registerMultiTask('modify', 'Modify a file content and name', function () {
        grunt.config.requires(['modify', 'base']);
        grunt.config.requires(['modify', 'files']);
        grunt.config.requires(['modify', 'dest'], ['modify', 'modifier']);
        grunt.config.requires(['modify', 'modifier']);

        var path = require('path');
        var fs = require('fs');

        var done = this.async();
        var options = grunt.config('modify');
        options.base = path.normalize(options.base);
        var files = getFiles(options);
        var successCounter = 0;

        files.forEach(function (file) {
            var mod;

            function processFile(err, content) {
                if (err) {
                    grunt.fatal('Error reading file: ' + file);
                } else {
                    var fileNameRelativeToBase = path.relative(options.base, file);
                    mod = options.modifier(fileNameRelativeToBase, content);
                    mod.name = mod.name ? path.resolve(options.dest, mod.name) : path.resolve(options.dest, file);
                    mod.name = utils.unixpath(mod.name);
                    grunt.file.mkdir(path.dirname(mod.name));
                    fs.writeFile(mod.name, mod.content, writeFile);
                }
            }

            function writeFile(err) {
                if (err) {
                    grunt.fatal('Error writing file: ' + mod.name);
                } else {
                    successCounter++;
                    if (successCounter === files.length) {
                        done();
                    }
                }
            }

            fs.readFile(file, 'utf8', processFile);
        });
    });

    function getFiles(options) {
        var files = [];
        options.files.forEach(function (file) {
            var someFiles = grunt.file.expandFiles(options.base + '/' + file);
            files.push.apply(files, someFiles);
        });
        return files;
    }
};