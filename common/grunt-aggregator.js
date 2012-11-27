var grunt = require('grunt');
grunt.loadNpmTasks('grunt-jasmine-node');
grunt.loadNpmTasks('grunt-clean');

// Actually load this plugin's task(s).
grunt.loadTasks('tasks');
grunt.config.set('jshint', require('./jshint.json'));
