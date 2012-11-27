'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var utils = require('../common/utils.js')(grunt);

    grunt.registerTask('list', 'makes a files list by template', function () {
        var options = grunt.config.get('list');
        if (this.args && this.args[0]) {
            grunt.config.requires(['list', this.args[0], 'include']);
            grunt.config.requires(['list', this.args[0], 'dest']);
            options = options[this.args[0]];
            options.id = this.args[0];
        } else {
            grunt.config.requires(['list', 'include']);
            grunt.config.requires(['list', 'dest']);
            options.id = options.base || options.relativeTo || "generated.manifest" + parseInt((Math.random() * 0xffffffff),36);
        }

        options.base = options.base || '.';
        options.relativeTo = options.relativeTo || options.base;
        options.exclude = options.exclude || [];
        var resourcesTempplate = 'files.map( ' +
                'function (fileName) { ' +
                'var ret = { url:fileName }; ' +
                'if (fileName.lastIndexOf(".json") === fileName.length-5) {' +
                'ret.id = fileName.replace(new RegExp("/","g"),".");}' +
                ' return ret' +
                '})';

        options.template = options.template || '<%= JSON.stringify([{url:"' + options.relativeTo +
                '", id:"' + options.id +
                '", resources: ' + resourcesTempplate + '}], null, 4) %>';

        var allFiles = [];

        options.include.forEach(function (file) {
            var files = grunt.file.expandFiles(utils.unixpath(options.base + "/" + file));
            files.forEach(function (fileName) {
                allFiles.push(path.relative(options.relativeTo, fileName));
            });
        });

        allFiles = utils.cleanArray(allFiles);

        options.exclude.forEach(function (file) {
            var files = grunt.file.expandFiles(utils.unixpath(options.base + "/" + file));
            files.forEach(function (fileName) {
                allFiles = grunt.utils._.without(allFiles, utils.unixpath(path.relative(options.relativeTo, fileName)));
            });
        });

        allFiles = utils.cleanArray(allFiles);
        grunt.file.write(options.dest, grunt.template.process(options.template, {files:allFiles}));
    });
};