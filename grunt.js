/**
 * created by Omri
 * Date: 11/25/12
 * Time: 2:48 PM
 */
/*
 * grunt-contrib-uglify
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        lint:{
            all:[
                'grunt.js',
                'src/**.js',
                'test/**.js'
            ]
        },

        jshint: {
            options: {
                node: true
            }
        },

        jasmine_node: {
           specNameMatcher: "spec",
           projectRoot: ".",
           requirejs: false,
           forceExit: true,
           jUnit: {
             report: false,
             savePath : "./build/reports/jasmine/",
             useDotNotation: true,
             consolidate: true
           }
         },

        aggregation: {
            src: "test/resources/aggregations.json",
            dest: "target"
        },

        clean: {
            test: "target"
        }
    });

    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-clean');

    // Actually load this plugin's task(s).
    grunt.loadTasks('src/javascript/tasks');

    // By default, lint and run all tests.
    grunt.registerTask('default', ['clean', 'lint', 'aggregate', 'jasmine_node', 'min']);
};