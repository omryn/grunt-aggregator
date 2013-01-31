module.exports = function(grunt) {
    'use strict';

    var esprima = require('esprima'),
        escodegen = require('escodegen');

    grunt.registerMultiTask('greatescape', 'Escape files till they ll be concatenable', function() {
        var files = grunt.file.expand(this.file.src);

        grunt.verbose.writeln("Start escaping files".bold);
        files.forEach(function greatEscape(src) {
            var code = grunt.file.read(src);


            var a = {
                esc: (new Function(code)).toString()
            };

            var b = JSON.stringify(a);

            var prefixLength = '{"esc":"function anonymous() {'.length;

            grunt.file.write(src, b.substr(prefixLength, (b.length - 3 - prefixLength)));
        });
        grunt.verbose.writeln("Done escaping files".bold);

    });
};
