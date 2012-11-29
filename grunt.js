'use strict';
module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        lint:{
            all:[
                'grunt.js',
                'tasks/**/*.js',
                'test/javascript/**/*.js'
            ]
        },

        jshint:'<json:common/jshint.json>',

        jasmine_node:{
            specNameMatcher:"spec",
            projectRoot:    ".",
            requirejs:      false,
            forceExit:      true,
            jUnit:          {
                report:        false,
                savePath:      "./build/reports/jasmine/",
                useDotNotation:true,
                consolidate:   true
            }
        },

        aggregate:{
            main:{
                src: "test/resources/aggregations.json",
                dest:"target"
            }
        },

        modify:{
            json:{
                base:    'test/resources',
                files:   ['dir*/**/*.json'],
                dest:    'target/mod',
                modifier:function (name, content) {
                    return {
                        name:   name.indexOf('subdir1_2') >= 0 ? 'genereated.name.json' : name,
                        content:'[' + content + ']'
                    };
                }
            }
        },

        list:{
            test:{
                base:   'test/resources',
                include:["**/*.json", "dir2/**/*"],
                exclude:["aggregations.json"],
                dest:   'target/files.list.json',
                id:     "test"
            }
        },

        clean:{
            test:"target"
        }
    });

    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // By default, lint and run all tests.
//    grunt.registerTask('default', ['clean', 'lint', 'aggregate', 'list', 'jasmine_node']);
//    grunt.registerTask('default', ['clean', 'list']);
    grunt.registerTask('default', ['clean', 'lint', 'list', 'modify', 'aggregate', 'lint', 'min', 'jasmine_node']);
};