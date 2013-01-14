module.exports = function (grunt) {
    'use strict';
    var path = require('path');
    var fs = require('fs');
    var utils = require('../common/utils.js')(grunt);
    var options;

    function validateAggregation(aggregation) {
        if (!aggregation.id || typeof aggregation.id !== 'string') {
            grunt.fail.fatal('Invalid aggregation: "' + aggregation + '" must contain an "id" field (non-empty string). \nExample: "id":"my-aggregation"');
        }
        if (!/^[\w\d#]+$/.test(aggregation.id)) {
            grunt.fail.fatal('Invalid aggregation: "' + aggregation.id + '" contains an invalid id (may contain only letters , numbers and #)');
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

        setAggregationProperty(aggregation, 'lint');
        setAggregationProperty(aggregation, 'copy');
        setAggregationProperty(aggregation, 'min');
        setAggregationProperty(aggregation, 'mincss');
        setAggregationProperty(aggregation, 'manymin');
    }

    function setAggregationProperty(aggregation, property) {
        if (!(property in aggregation)) {
            aggregation[property] = options[property];
        }
    }

    function setMin(min, aggregation, aggregationFiles, manifest, debugManifest) {
        var files = aggregationFiles.filter(js);
        if (aggregation.min && files.length) {
            var dest = utils.unixpath(aggregation.dest + ".min.js", aggregation.targetDir);
            var sources = utils.cleanArray(files, aggregation.sourceDir + "/" + aggregation.package);
            if (sources.length) {
                min[aggregation.targetDir + '/' + aggregation.package + '#' + aggregation.id] = {
                    src:sources,
                    dest:dest
                };
                if (!aggregation.excludeFromManifest) {
                    var entry = createManifestEntry(aggregation);
                    entry.url = utils.unixpath(path.relative(aggregation.manifestPath, dest));
                    manifest.push(entry);

                    var debugEntry = createManifestEntry(aggregation);
                    debugEntry.url = utils.unixpath(path.relative(aggregation.manifestPath, aggregation.targetDir + "/" + aggregation.package));
                    debugEntry.resources = files.map(function (url) {
                        return {url:url};
                    });
                    debugManifest.push(debugEntry);
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
                sources.forEach(function (script, index) {
                    min['manymin#' + aggregation.id + '#' + script] = {
                        src:script,
                        dest:targets[index]
                    };
                });
                if (!aggregation.excludeFromManifest) {
                    var entry = createManifestEntry(aggregation);
                    entry.url = utils.unixpath(aggregation.package);
                    entry.resources = files.map(function (url) {
                        return {url:url};
                    });
                    manifest.push(entry);
                    debugManifest.push(entry);
                }
            }
        }
    }

    function setMinCss(mincss, aggregation, aggregationFiles, manifest, debugManifest) {
        var files = aggregationFiles.filter(css);
        if (aggregation.mincss && files.length) {
            var src = utils.cleanArray(files, aggregation.sourceDir + "/" + aggregation.package);
            var dest = utils.unixpath(aggregation.dest + ".min.css", aggregation.targetDir);
            if (src.length > 0) {
                mincss[aggregation.targetDir + '/' + aggregation.package + '#' + aggregation.id] = {
                    files:{
                    }
                };
                mincss[aggregation.targetDir + '/' + aggregation.package + '#' + aggregation.id]
                    .files[dest] = src;
            }
            if (!aggregation.excludeFromManifest) {
                var entry = createManifestEntry(aggregation, '#css');
                entry.url = utils.unixpath(aggregation.package);
                entry.resources = files.map(function (url) {
                    return {url:url};
                });
                debugManifest.push(entry);

                var minEntry = createManifestEntry(aggregation, '#css');
                minEntry.url = utils.unixpath(aggregation.dest + ".min.css", aggregation.package);
                manifest.push(minEntry);
            }
        }
    }

    function setCopy(copy, aggregation, aggregationFiles, manifest, debugManifest) {
        if (aggregation.copy) {
            var _id = aggregation.targetDir + '/' + aggregation.package + '#' + aggregation.id;
            copy[_id] = {files:{}};

            aggregationFiles.forEach(function (file) {
                var src = utils.unixpath(file, aggregation.sourceDir + "/" + aggregation.package);
                var target = utils.unixpath(file, aggregation.targetDir + "/" + aggregation.package);
                copy[_id].files[target] = src;
            });
            if (!aggregation.min && !aggregation.manymin && !aggregation.excludeFromManifest) {
                var entry = createManifestEntry(aggregation);
                entry.url = utils.unixpath(aggregation.targetDir + "/" + aggregation.package);
                entry.resources = aggregationFiles.map(function (url) {
                    return {url:url};
                });
                debugManifest.push(entry);
            }
        }
    }

    function setList(aggregation, aggregationFiles, manifest, debugManifest) {
        if (!aggregation.copy && !aggregation.min && !aggregation.manymin && !aggregation.excludeFromManifest) {

            var entry = createManifestEntry(aggregation);
            entry.url = utils.unixpath(path.relative(aggregation.manifestPath, aggregation.targetDir + "/" + aggregation.package));
            entry.resources = aggregationFiles.map(function (url) {
                return {url:url};
            });
            debugManifest.push(entry);
        }
    }

    function setLint(lint, aggregation, aggregationFiles) {
        if (aggregation.lint) {
            var filesToLint = utils.cleanArray(aggregationFiles, aggregation.sourceDir).filter(function (fileName) {
                return (/.*\.js$/).test(fileName);
            });
            if (filesToLint.length > 0) {
                lint[aggregation.targetDir + '/' + aggregation.package + '#' + aggregation.id] = filesToLint;
            }
        }
    }

    function createManifestEntry(aggregation, idPostFix) {
        var entry = {
            id:aggregation.id + (idPostFix || ''),
            tags:aggregation.tags
        };
        if (aggregation.atPhase) {
            entry.atPhase = aggregation.atPhase;
        }
        return entry;
    }

    function extractFiles(aggregation) {
        var allFiles = [];
        aggregation.include.forEach(function (file) {
            var filesDef = utils.unixpath(file, aggregation.sourceDir + "/" + aggregation.package);
            var dir = filesDef;
            if (dir.indexOf("*") >= 0) {
                var includeInPath = true;
                var tmp = dir.split("/").filter(function (pathPart) {
                    includeInPath = includeInPath && pathPart.indexOf("*") < 0;
                    includeInPath = includeInPath && pathPart.indexOf("?") < 0;
                    return includeInPath;
                });
                dir = tmp.join("/");
            }
            if (fs.existsSync(dir)) {
                var files = grunt.file.expandFiles(filesDef);
                files.forEach(function (fileName) {
                    fileName = utils.unixpath(path.relative(aggregation.sourceDir + "/" + aggregation.package, fileName));
                    allFiles.push(fileName);
                });
            } else {
                grunt.warn("Aggregation " + aggregation.id.bold + " includes missing folder or file: " + dir.red + " @ " + filesDef.bold);
            }
        });

        allFiles = utils.cleanArray(allFiles);

        aggregation.exclude.forEach(function (file) {
            var files = grunt.file.expandFiles(utils.unixpath(file, aggregation.sourceDir + "/" + aggregation.package));
            files.forEach(function (fileName) {
                fileName = utils.unixpath(path.relative(aggregation.sourceDir + "/" + aggregation.package, fileName));
                allFiles = grunt.utils._.without(allFiles, fileName);
            });
        });

        grunt.log.write("Aggregating ".bold + aggregation.id.bold + "...");
        grunt.verbose.writeln(JSON.stringify(aggregation, null, 4).cyan);
        grunt.verbose.writeln("Included files:");
        grunt.verbose.writeln(JSON.stringify(allFiles, null, 4).cyan);
        return utils.cleanArray(allFiles);
    }

    function setFollowingTasks(aggregation, aggregationFiles, copy, min, lint, mincss, manifest, debugManifest) {
        setCopy(copy, aggregation, aggregationFiles, manifest, debugManifest);
        setMin(min, aggregation, aggregationFiles, manifest, debugManifest);
        setManyMin(min, aggregation, aggregationFiles, manifest, debugManifest);
        setMinCss(mincss, aggregation, aggregationFiles, manifest, debugManifest);
        setList(aggregation, aggregationFiles, manifest, debugManifest);
        setLint(lint, aggregation, aggregationFiles);
    }

    function runLint(lint) {
        if (options.lint && Object.keys(lint).length > 0) {
            grunt.config.set('lint', lint);
            grunt.verbose.write("Linting files files. ");
            grunt.verbose.writeln(JSON.stringify(grunt.config.get('lint'), null, 4).cyan);
            grunt.task.run('lint');
        }
    }

    function runMin(manifest, min) {
        if (options.manymin || options.min) {
            if (Object.keys(min).length > 0) {
                writeManifest(manifest);
                grunt.config.set('min', min);
                grunt.verbose.write("Minifying files. ");
                grunt.verbose.writeln(JSON.stringify(grunt.config.get('min'), null, 4).cyan);
                grunt.task.run('min');
            }
        }
    }

    function runMinCss(manifest, mincss) {
        if (options.min && Object.keys(mincss).length > 0) {
            writeManifest(manifest);
            grunt.config.set('mincss', mincss);
            grunt.verbose.write("Minifying CSS files. ");
            grunt.verbose.writeln(JSON.stringify(grunt.config.get('mincss'), null, 4).cyan);
            grunt.task.run('mincss');
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
        options.mincss = options.mincss === undefined ? true : options.min;
        options.lint = options.lint === undefined ? true : options.lint;
        options.copy = options.copy === undefined ? true : options.copy;
    }

    grunt.registerMultiTask('aggregate', 'Minifies, copies files and create index.json and index.debug.json', function () {
        options = this.data;
        grunt.log.write("Loading aggregation file ");
        grunt.log.writeln(options.src.cyan);

        var aggregations = grunt.file.readJSON(options.src);
        prepOptions();

        var min = grunt.config.get('min') || {};
        var mincss = grunt.config.get('mincss') || {};
        var copy = grunt.config.get('copy') || {};
        var lint = grunt.config.get('lint') || {};
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

            setFollowingTasks(aggregation, aggregationFiles, copy, min, lint, mincss, manifest, debugManifest);
            grunt.log.ok();
        });

        writeDebugManifest(debugManifest);
        runLint(lint);
        runCopy(copy);
        runMin(manifest, min);
        runMinCss(manifest, mincss);
    });
};