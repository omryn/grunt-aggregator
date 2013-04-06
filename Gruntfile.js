module.exports = function (grunt) {
    'use strict';
    // Project configuration.
    grunt.initConfig({
        jshint: {
            options: {
                "expr": true,
                "laxcomma": true,
                "smarttabs": true,
                "curly": true,
                "eqeqeq": false,
                "immed": true,
                "latedef": true,
                "newcap": true,
                "noarg": true,
                "sub": true,
                "es5": true,
                "undef": true,
                "eqnull": true,
                "browser": true,
                "regexdash": true,
                "loopfunc": true,
                "mootools": true,
                "node": true,
                globals: {
                    "Mousetrap": true,
                    "Modernizr": true,

                    "mootools": true,
                    "nsUtil": true,
                    "resource": true,
                    "define": true,
                    "debugMode": true,
                    "rendererModel": true,
                    "viewMode": true,
                    "WixGoogleAnalytics": true,

                    "siteHeader": true,
                    "editorModel": true,
                    "siteId": true,
                    "LOG": true,
                    "PHASES": true,
                    "wixLogLegend": true,
                    "wixEvents": true,
                    "WixLogger": true,
                    "wixErrors": true,
                    "WixBILogger": true,
                    "managers": true,
                    "classDefinition": true,
                    "Utils": true,
                    "UtilsClass": true,
                    "WClass": true,
                    "W": true,

                    "e": true,
                    "l": true,
                    "s": true,
                    "m": true,
                    "g": true,
                    "d": true,
                    "f": true,
                    "t": true,

                    "after": true,
                    "unescape": true,
                    "alert": true,
                    "missingItems": true,
                    "hex_sha256": true,
                    "XDomainRequest": true,
                    "_userAnalyticsAccount": true,
                    "getCookieInfo": true,
                    "creationSource": true,
                    "ActiveXObject": true,
                    "Test": true,
                    "main": true,
                    "Async": true,
                    "console": true,
                    "Request": true,
                    "getAsyncExpects": true,
                    "fail": true,
                    "pageTracker": true,
                    "_gat": true,
                    "Constants": true,
                    "expect": true,
                    "describe": true,
                    "beforeEach": true,
                    "it": true,
                    "waits": true,
                    "runs": true,
                    "waitsFor": true,
                    "afterEach": true,
                    "spyOn": true,
                    "sleep": true,
                    "jasmine": true,
                    "getPlayGround": true,
                    "Element": true,
                    "typeOf": true,
                    "getSpy": true,
                    "MockBuilder": true,
                    "Define": true,
                    "instanceOf": true,
                    "xdescribe": true,
                    "merge": true,
                    "clone": true
                }
            },
            all: [
                'Gruntfile.js',
                'tasks/**/*.js',
                'test/javascript/**/*.js'
            ]
        },

        jasmine_node: {
            specNameMatcher: "spec",
            projectRoot: ".",
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: false,
                savePath: "./build/reports/jasmine/",
                useDotNotation: true,
                consolidate: true
            }
        },

        aggregate: {
            "ordered-list": {
                src: "test/resources/ordered-list.json",
                manifest: "target/ordered-list.json"
            },
            main: {
                src: "test/resources/aggregations.json",
                manifest: "target/manifest.json"
            },
            'no-min': {
                src: "test/resources/no-min.json",
                manifest: 'target/no-min.json',
                min: false
            },
            'no-copy': {
                src: "test/resources/no-copy.json",
                manifest: 'target/no-copy.json',
                copy: false
            },
            list: {
                src: "test/resources/list.json",
                manifest: 'target/list.json',
                manifestCopy: 'target/list.copy.json',
                min: false,
                copy: false
            },
            exclude: {
                src: "test/resources/exclude.json",
                manifest: 'target/exclude.json',
                manifestCopy: 'target/exclude.copy.json'
            },
            css: {
                src: "test/resources/css.json",
                manifest: 'target/css.json'
            },
            manymin: {
                src: "test/resources/manymin.json",
                manifest: "target/manymin.json",
                min: false,
                manymin: true,
                copy: false
            }
        },

        modify: {
            json: {
                base: 'test/resources',
                src: ['dir*/**/*.json'],
                dest: 'target/mod',
                modifier: function (name, content) {
                    return {
                        name: name.search('subdir1_2') !== -1 ? 'genereated.name.json' : name,
                        content: '[' + content + ']'
                    };
                }
            }
        },

        clean: {
            test: "target"
        },

        copy: {
            target: {
                files: {
                    'target/aggregations/greatescape/escaped.js': ['test/greatescape/original.js']
                }
            }
        },

        greatescape: {
            all: 'target/aggregations/greatescape/escaped.js'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');


// Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

// By default, lint and run all tests.
    grunt.registerTask('default', ['clean', 'jshint', 'modify', 'aggregate']);
};
