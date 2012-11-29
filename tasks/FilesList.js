'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var utils = require('../common/utils.js')(grunt);

    grunt.registerMultiTask('list', 'makes a files list by template', function () {
        var options = this.data;
        options.id = options.id  || options.base || options.relativeTo || "generated.manifest" + parseInt((Math.random() * 0xffffffff), 36);
        options.url = options.relativeTo || options.base || './';
        var allFiles = grunt.task.helper('makelist', options);
        var out = grunt.task.helper('parselist', options, allFiles, true);

        grunt.file.write(options.dest, out);
    });
};