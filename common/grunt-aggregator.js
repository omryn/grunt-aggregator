"use strict";
var grunt = require('grunt');
grunt.loadNpmTasks('grunt-clean');
grunt.loadNpmTasks('grunt-contrib-copy');

// Actually load this plugin's task(s).
grunt.loadTasks('tasks');
grunt.config.set('jshint', require('./jshint.json'));
