module.exports = function (grunt) {
    'use strict';

	var esprima   = require('esprima'),
        escodegen = require('escodegen');

    grunt.registerMultiTask('greatescape', 'Escape files till they ll be concatenable', function() {
        var option = {
            format: {
                indent: {
                    style: '',
                    base:0
                },
                quotes: 'single',
                compact:true
            }
        };

        var files = grunt.file.expand(this.file.src);

        grunt.verbose.writeln("Start escaping files".bold);
        files.forEach(function greatEscape (src) {
            grunt.verbose.writeln("Escaping file: ".bold + src.green);
            var code = grunt.file.read(src);
            var syntax = esprima.parse(code, {raw:true});
            var escapedCode = escodegen.generate(syntax, option);
            var reEscapedCode = escapedCode.replace(/\"/g,'\\\"');
            grunt.file.write(src,reEscapedCode);
        });
        grunt.verbose.writeln("Done escaping files".bold);

    });
};
