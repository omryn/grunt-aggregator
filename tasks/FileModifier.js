'use strict';
module.exports = function (grunt) {
    var utils = require('../common/utils.js')(grunt);

    grunt.registerMultiTask('modify', 'Modify a file content and name', function () {
        var options = this.data;
        var path = require('path');
        var fs = require('fs');

        var done = this.async();
        options.base = path.normalize(options.base);

        var files = grunt.file.expand({filter: 'isFile', cwd: options.base}, options.src);

        if (files.length > 0) {
            var successCounter = 0;

            grunt.verbose.writeflags(options);
            grunt.verbose.writeln(JSON.stringify(files));

            files.forEach(function (file) {
                var mod;

                function processFile(err, content) {
                    grunt.verbose.writeln("Parsing file: ".bold + file.green);
                    grunt.verbose.writeln(content.cyan);
                    if (err) {
                        grunt.fatal('Error reading file: ' + file);
                    } else {
                        mod = options.modifier(file, content);

                        if (mod) {
                            mod.name = mod.name ? path.resolve(options.dest, mod.name) : path.resolve(options.dest, file);
                            grunt.file.mkdir(path.dirname(mod.name));

                            fs.writeFile(mod.name, mod.content || content, writeFile);
                        }
                    }
                }

                function writeFile(err) {
                    if (err) {
                        grunt.fatal('Error writing file: ' + mod.name);
                        done();
                    } else {
                        grunt.verbose.writeln("Done writing file: ".bold + file.green);
                        successCounter++;
                        if (successCounter === files.length) {
                            done();
                        }
                    }
                }

                grunt.verbose.writeln("Reading file: ".bold + file.green);
                fs.readFile(path.resolve(options.base, file), 'utf8', processFile);
            });
        } else {
            grunt.verbose.writeln('No files were modified');
            done();
        }
    });
};
