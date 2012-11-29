module.exports = function (grunt) {
    'use strict';
    var utils = require('../common/utils.js')(grunt);

    grunt.registerMultiTask('modify', 'Modify a file content and name', function () {
        var options = this.data;
        var path = require('path');
        var fs = require('fs');

        var done = this.async();
        options.base = path.normalize(options.base);
        var files = getFiles(options);
        if (files.length === 0) {
            done();
            return;
        }
        var successCounter = 0;

        grunt.verbose.writeflags(options);
        grunt.verbose.writeln(JSON.stringify(files));

        files.forEach(function (file) {
            var mod;
            grunt.verbose.writeln("Modifying file: ".bold + file.green);

            function processFile(err, content) {
                grunt.verbose.writeln("Parsing file: ".bold + file.green);
                grunt.verbose.writeln(content.cyan);
                if (err) {
                    grunt.fatal('Error reading file: ' + file);
                } else {
                    var fileNameRelativeToBase = path.relative(options.base, file);
                    mod = options.modifier(fileNameRelativeToBase, content);
                    if (mod) {
                        mod.name = mod.name ? path.resolve(options.dest, mod.name) : path.resolve(options.dest, file);
                        mod.name = utils.unixpath(mod.name);
                        grunt.file.mkdir(path.dirname(mod.name));
                        fs.writeFile(mod.name, mod.content, writeFile);
                    }
                }
            }

            function writeFile(err) {
                grunt.verbose.writeln("Done writing file: ".bold + file.green);
                if (err) {
                    grunt.fatal('Error writing file: ' + mod.name);
                    done();
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