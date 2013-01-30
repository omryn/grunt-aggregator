module.exports = function (grunt) {
    'use strict';
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
            projectRoot:".",
            requirejs:false,
            forceExit:true,
            jUnit:{
                report:false,
                savePath:"./build/reports/jasmine/",
                useDotNotation:true,
                consolidate:true
            }
        },

        aggregate:{
            "ordered-list":{
                src:"test/resources/ordered-list.json",
                manifest:"target/ordered-list.json"
            },
            main:{
                src:"test/resources/aggregations.json",
                manifest:"target/manifest.json"
            },
            'no-min':{
                src:"test/resources/no-min.json",
                manifest:'target/no-min.json',
                min:false
            },
            'no-copy':{
                src:"test/resources/no-copy.json",
                manifest:'target/no-copy.json',
                copy:false
            },
            list:{
                src:"test/resources/list.json",
                manifest:'target/list.json',
                manifestCopy:'target/list.copy.json',
                min:false,
                copy:false
            },
            exclude:{
                src:"test/resources/exclude.json",
                manifest:'target/exclude.json',
                manifestCopy:'target/exclude.copy.json'
            },
            css:{
                src:"test/resources/css.json",
                manifest:'target/css.json'
            },
            manymin: {
                src:"test/resources/manymin.json",
                manifest:"target/manymin.json",
                min: false,
                manymin: true,
                copy: false
            }
        },

        modify:{
            json:{
                base:'test/resources',
                files:['./dir*/**/*.json'],
                dest:'target/mod',
                modifier:function (name, content) {
                    return {
                        name:name.search('subdir1_2') !== -1 ? 'genereated.name.json' : name,
                        content:'[' + content + ']'
                    };
                }
            }
        },

        clean:{
            test:"target"
        },

        copy:{
            target:{
                files:{
                    'target/aggregations/greatescape/escaped.js':['test/resources/greatescape/original.js']
                }
            }
        },

        greatescape:{
            all: 'target/aggregations/greatescape/escaped.js'
        }
    })
    ;

    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-mincss');

// Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

// By default, lint and run all tests.
    grunt.registerTask('default', ['clean', 'lint', 'modify', 'aggregate', 'greatescape', 'jasmine_node']);
};
