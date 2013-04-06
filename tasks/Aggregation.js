'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var fs = require('fs');
    var utils = require('../common/utils.js')(grunt);
    var _ = grunt.util._;
    var options;

    function validateAggregation(aggregation) {
        if (!aggregation.id || typeof aggregation.id !== 'string') {
            grunt.fail.fatal('Invalid aggregation: "' + aggregation + '" must contain an "id" field (non-empty string). \nExample: "id":"my-aggregation"');
        }
        if (!/^[\w\d#\-]+$/.test(aggregation.id)) {
            grunt.fail.fatal('Invalid aggregation: "' + aggregation.id + '" contains an invalid id (may contain only letters , numbers, - and #)');
        }
        if (!aggregation.tags || !aggregation.tags.length) {
            grunt.fail.fatal('Invalid aggregation: "' + aggregation.id + '" must contain a "tags" field (non-empty array of strings). \nExample: "tags": ["common","viewer"]');
        }
        if (!aggregation.include || !aggregation.include.length) {
            grunt.fail.fatal('Invalid aggregation: "' + aggregation.id + '" must contain a "include" field (non-empty array of strings). \nExample: "include": ["**/*.js","resources/**/*.json"]');
        }
        if (!aggregation.exclude || !(aggregation.exclude instanceof Array)) {
            grunt.fail.fatal('Invalid aggregation: "' + aggregation.id + '" must contain a "exclude" field (array of strings). \nExample: "exclude": ["**/~*"]');
        }
        if (typeof aggregation.targetDir !== 'string') {
            grunt.fail.fatal('Invalid aggregation: "' + aggregation.id + '" must contain an "targetDir" field (valid path). \nExample: "targetDir":"target/main/javascript"');
        }
        if (typeof aggregation.sourceDir !== 'string') {
            grunt.fail.fatal('Invalid aggregation: "' + aggregation.id + '" must contain an "sourceDir" field (valid path). \nExample: "sourceDir":"src/main/javascript"');
        }
        if (typeof aggregation.package !== 'string') {
            grunt.fail.fatal('Invalid aggregation: "' + aggregation.id + '" must contain an "package" field (valid path). \nExample: "package":"bootstrap/bootstrap"');
        }
    }

    function js(url) {
        return (/\.js$/).test(url);
    }

    function css(url) {
        return (/\.css$/).test(url);
    }

    function prepAggregation(aggregation) {
        aggregation.dest = aggregation.id.replace(/#.*$/g, "");
        aggregation.manifestPath = path.dirname(options.manifest);
        aggregation.targetDir = utils.unixpath(aggregation.targetDir, aggregation.manifestPath);

        setAggregationProperty(aggregation, 'copy');
        setAggregationProperty(aggregation, 'min');
        setAggregationProperty(aggregation, 'cssmin');
        setAggregationProperty(aggregation, 'manymin');
    }

    function setAggregationProperty(aggregation, property) {
        if (!(property in aggregation)) {
            aggregation[property] = options[property];
        }
    }

    function setMin(min, aggregation, aggregationFiles, manifest, debugManifest) {
        var files = aggregationFiles.filter(js);
        var dest = utils.unixpath(aggregation.dest + ".min.js", aggregation.targetDir);
        var debugEntry = createManifestEntry(aggregation);

        if (files.length) {
            if (aggregation.min) {

                var sources = utils.cleanArray(files, aggregation.sourceDir + "/" + aggregation.package);
                if (sources.length) {
                    var targets = {};
                    targets[dest] = sources;
                    min[aggregation.targetDir + '/' + aggregation.package + '#' + aggregation.id] = {
                        files:targets
                    };
                }
            }
            if (!aggregation.excludeFromManifest) {
                if (aggregation.copy) {
                    debugEntry.url = utils.unixpath(path.relative(aggregation.manifestPath, aggregation.targetDir + "/" + aggregation.package));
                    debugEntry.resources = files.map(function (url) {
                        return {url: url};
                    });
                    debugManifest.push(debugEntry);
                }

                if (aggregation.min) {
                    var entry = createManifestEntry(aggregation);
                    entry.url = utils.unixpath(path.relative(aggregation.manifestPath, dest));

                    manifest.push(entry);
                } else {
                    if (aggregation.copy) {
                        manifest.push(debugEntry);
                    }
                }
            }
        }
    }

    function setManyMin(min, aggregation, aggregationFiles, manifest, debugManifest) {
        var files = aggregationFiles.filter(js);
        if (aggregation.manymin && files.length) {
            var sources = utils.cleanArray(files, aggregation.sourceDir + "/" + aggregation.package);
            var targets = utils.cleanArray(files, aggregation.targetDir + "/" + aggregation.package);
            if (sources.length) {
                min['manymin#' + aggregation.id] = {
                    files:{}
                };
                sources.forEach(function (script, index) {
                    min['manymin#' + aggregation.id].files[targets[index]] = [script];
                });
                if (!aggregation.excludeFromManifest) {
                    var entry = createManifestEntry(aggregation);
                    entry.url = utils.unixpath(aggregation.package);
                    entry.resources = files.map(function (url) {
                        return {url: url};
                    });
                    manifest.push(entry);
                    debugManifest.push(entry);
                }
            }
        }
    }

    function setCssMin(cssMin, aggregation, aggregationFiles, manifest, debugManifest) {
        var files = aggregationFiles.filter(css);
        if (aggregation.cssmin && files.length) {
            var src = utils.cleanArray(files, aggregation.sourceDir + "/" + aggregation.package);
            var dest = utils.unixpath(aggregation.dest + ".min.css", aggregation.targetDir);
            if (src.length > 0) {
                cssMin[aggregation.targetDir + '/' + aggregation.package + '#' + aggregation.id] = {
                    files: {
                    }
                };
                cssMin[aggregation.targetDir + '/' + aggregation.package + '#' + aggregation.id]
                    .files[dest] = src;
            }
            if (!aggregation.excludeFromManifest) {
                var debugEntry = createManifestEntry(aggregation, '#css');
                debugEntry.url = utils.unixpath(path.relative(aggregation.manifestPath, aggregation.targetDir + "/" + aggregation.package));
                debugEntry.resources = files.map(function (url) {
                    return {url: url};
                });
                debugManifest.push(debugEntry);

                var minEntry = createManifestEntry(aggregation, '#css');
                minEntry.url = utils.unixpath(path.relative(aggregation.manifestPath, aggregation.targetDir + "/" + aggregation.dest + ".min.css"));
                //utils.unixpath(aggregation.dest + ".min.css", aggregation.package);
                manifest.push(minEntry);
            }
        }
    }

    function setCopy(copy, aggregation, aggregationFiles, manifest, debugManifest) {
        if (aggregation.copy) {
            var _id = aggregation.targetDir + '/' + aggregation.package + '#' + aggregation.id;
            copy[_id] = {files: {}};

            aggregationFiles.forEach(function (file) {
                var src = utils.unixpath(file, aggregation.sourceDir + "/" + aggregation.package);
                var target = utils.unixpath(file, aggregation.targetDir + "/" + aggregation.package);
                copy[_id].files[target] = src;
            });
        }
    }

    function setList(aggregation, aggregationFiles, manifest, debugManifest) {
        if (!aggregation.copy && !aggregation.min && !aggregation.manymin && !aggregation.excludeFromManifest) {

            var entry = createManifestEntry(aggregation);
            entry.url = utils.unixpath(path.relative(aggregation.manifestPath, aggregation.targetDir + "/" + aggregation.package));
            entry.resources = aggregationFiles.map(function (url) {
                return {url: url};
            });
            debugManifest.push(entry);
        }
    }


    function createManifestEntry(aggregation, idPostFix) {
        var entry = {
            id: aggregation.id + (idPostFix || ''),
            tags: aggregation.tags
        };
        if (aggregation.atPhase) {
            entry.atPhase = aggregation.atPhase;
        }
        return entry;
    }

    function extractPathExcludingWildCards(dir) {
        if (dir.indexOf("*") >= 0) {
            var includeInPath = true;
            var tmp = dir.split("/").filter(function (pathPart) {
                includeInPath = includeInPath && pathPart.indexOf("*") < 0;
                includeInPath = includeInPath && pathPart.indexOf("?") < 0;
                return includeInPath;
            });
            dir = tmp.join("/");
        }
        return dir;
    }

    function extractFiles(aggregation) {
        var allFiles = [];
        aggregation.include.forEach(function (file) {



            var filesDef = utils.unixpath(file, aggregation.sourceDir + "/" + aggregation.package);
            var simplePath = extractPathExcludingWildCards(filesDef);

            if (fs.existsSync(simplePath)) {
                var files = grunt.file.expand(filesDef).sort();
                files.forEach(function (fileName) {
                    fileName = utils.unixpath(path.relative(aggregation.sourceDir + "/" + aggregation.package, fileName));
                    allFiles.push(fileName);
                });
            } else {
                grunt.warn("Aggregation " + aggregation.id.bold + " includes missing folder or file: " + simplePath.red + " @ " + filesDef.bold);
            }
        });

        allFiles = utils.cleanArray(allFiles);

        aggregation.exclude.forEach(function (file) {
            var files = grunt.file.expand(utils.unixpath(file, aggregation.sourceDir + "/" + aggregation.package));
            files.forEach(function (fileName) {
                fileName = utils.unixpath(path.relative(aggregation.sourceDir + "/" + aggregation.package, fileName));
                allFiles = _.without(allFiles, fileName);
            });
        });

        grunt.log.write("Aggregating ".bold + aggregation.id.bold + "...");
        grunt.verbose.writeln(JSON.stringify(aggregation, null, 4).cyan);
        grunt.verbose.writeln("Included files:");
        grunt.verbose.writeln(JSON.stringify(allFiles, null, 4).cyan);
        return utils.cleanArray(allFiles);
    }

    function setFollowingTasks(aggregation, aggregationFiles, copy, min, cssmin, manifest, debugManifest) {
        setCopy(copy, aggregation, aggregationFiles, manifest, debugManifest);
        setMin(min, aggregation, aggregationFiles, manifest, debugManifest);
        setManyMin(min, aggregation, aggregationFiles, manifest, debugManifest);
        setCssMin(cssmin, aggregation, aggregationFiles, manifest, debugManifest);
        setList(aggregation, aggregationFiles, manifest, debugManifest);
    }

    function runMin(min) {
        if (options.manymin || options.min) {
            if (Object.keys(min).length > 0) {
                grunt.config.set('uglify', min);
                grunt.verbose.write("Minifying files. ");
                grunt.verbose.writeln(JSON.stringify(grunt.config.get('uglify'), null, 4).cyan);
                grunt.task.run('uglify');
            }
        }
    }

    function runcssmin(cssmin) {
        if (options.min && Object.keys(cssmin).length > 0) {
            grunt.config.set('cssmin', cssmin);
            grunt.verbose.write("Minifying CSS files. ");
            grunt.verbose.writeln(JSON.stringify(grunt.config.get('cssmin'), null, 4).cyan);
            grunt.task.run('cssmin');
        }
    }

    function runCopy(copy) {
        if (options.copy && Object.keys(copy).length > 0) {
            grunt.config.set('copy', copy);
            grunt.verbose.write("Copying files. ");
            grunt.verbose.writeln(JSON.stringify(grunt.config.get('copy'), null, 4).cyan);
            grunt.task.run('copy');
        }
    }

    function writeManifest(manifest) {
        grunt.log.write("Writing ");
        grunt.log.write(options.manifest.cyan + "...");
        grunt.file.write(options.manifest, JSON.stringify(manifest));
        if (options.manifestCopy) {
            grunt.log.write("Writing ");
            grunt.log.write(options.manifestCopy.cyan + "...");
            grunt.file.write(options.manifestCopy, JSON.stringify(manifest));
        }
    }

    function writeDebugManifest(debugManifest) {
        grunt.log.write("Writing ");
        var manifestTarget = utils.unixpath(path.dirname(options.manifest) + "/" + path.basename(options.manifest, ".json") + ".debug.json");
        grunt.log.write(manifestTarget.cyan + "...");
        grunt.file.write(manifestTarget, JSON.stringify(debugManifest, null, 4));
        grunt.log.ok();
        if (options.manifestCopy) {
            grunt.log.write("Writing ");
            manifestTarget = utils.unixpath(path.dirname(options.manifestCopy) + "/" + path.basename(options.manifestCopy, ".json") + ".debug.json");
            grunt.log.write(manifestTarget.cyan + "...");
            grunt.file.write(manifestTarget, JSON.stringify(debugManifest, null, 4));
            grunt.log.ok();
        }
    }

    function prepOptions() {
        options.min = options.min === undefined ? true : options.min;
        options.cssmin = options.cssmin === undefined ? true : options.min;
        options.copy = options.copy === undefined ? true : options.copy;
    }

    grunt.registerMultiTask('aggregate', 'Minifies, copies files and create index.json and index.debug.json', function () {
        options = this.data;
        grunt.log.write("Loading aggregation file ");
        grunt.log.writeln(options.src.cyan);

        var aggregations = grunt.file.readJSON(options.src);
        prepOptions();

        var min = grunt.config.get('uglify') || {};
        var cssmin = grunt.config.get('cssmin') || {};
        var copy = grunt.config.get('copy') || {};
        var manifest = [];
        var debugManifest = [];
        var allFiles = [];

        aggregations.forEach(function (aggregation) {
            validateAggregation(aggregation);
            prepAggregation(aggregation);

            var aggregationFiles = extractFiles(aggregation);
            if (aggregationFiles.length === 0) {
                grunt.warn("Aggregation " + aggregation.id.bold + " contains no files");
            }
            allFiles.push.apply(allFiles, aggregationFiles);

            setFollowingTasks(aggregation, aggregationFiles, copy, min, cssmin, manifest, debugManifest);
            grunt.log.ok();
        });

        writeDebugManifest(debugManifest);
        writeManifest(manifest);

        runCopy(copy);
        runMin(min);
        runcssmin(cssmin);
    });
};