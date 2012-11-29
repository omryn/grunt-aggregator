'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var utils = require('../common/utils.js')(grunt);

    grunt.registerHelper('parselist', function (options, files, asArray) {
        var resourcesTempplate = 'files.map( ' +
                'function (fileName) { ' +
                'var ret = { url:fileName }; ' +
                'if (fileName.length > 5 && fileName.lastIndexOf(".json") === fileName.length-5) {' +
                'ret.id = fileName.replace(new RegExp("/","g"),".");}' +
                ' return ret' +
                '})';
        if (!options.template) {
            if (asArray) {
                options.template = '<%= JSON.stringify([{url:"' + options.url +
                        '", id:"' + options.id +
                        '", resources: ' + resourcesTempplate + '}], null, 4) %>';
            } else {
                options.template = '<%= JSON.stringify({url:"' + options.url +
                        '", id:"' + options.id +
                        '", resources: ' + resourcesTempplate + '}, null, 4) %>';
            }
        }
        return grunt.template.process(options.template, {files:files});
    });
};