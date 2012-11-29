'use strict';

var fs = require('fs');
var readFile = fs.readFile;

describe("Aggregation manifest grunt plugin", function () {
    describe("manifest files", function () {
        it("should generate a manifest.json file", function (done) {
            expect('target/manifest.json').toHaveSameParsedContentAs('test/expected/manifest.json', done);
        });

        it("should generate a manifest.debug.json file", function (done) {
            expect('target/manifest.debug.json').toHaveSameParsedContentAs('test/expected/manifest.debug.json', done);
        });

        it("should exclude aggregations that have an non empty exclude", function (done) {
            expect('target/exclude.debug.json').toHaveSameParsedContentAs('test/expected/exclude.json', done);
        });
    });

    describe("minify", function () {
        it("should minify & concat all.min.js as defined in aggregations.json", function (done) {
            expect('target/aggregations/all.min.js').toHaveContent('1,2,3,4,5;', done);
        });

        it("should minify & concat dir1.min.js as defined in aggregations.json", function (done) {
            expect('target/aggregations/dir1.min.js').toHaveContent('1,2,3;', done);
        });

        it("should minify & concat dir2.min.js as defined in aggregations.json", function (done) {
            expect('target/aggregations/dir2.min.js').toHaveContent('4,5;', done);
        });

        it("should not minify files if the min:false flag is used", function (done) {
            expect('target/no-min/dir1').toExist();
            expect('target/no-min/dir2').toExist();
            expect('target/no-min/all.min.js').not.toExist();
            done();
        });
    });

    describe("css aggregaion", function () {
        it("should minify the css as a separate file", function (done) {
            expect('target/css/css.min.js').toHaveContent('1,2;', done);
        });

        it("should minify the js as a separate file", function (done) {
            expect('target/css/css.min.css').toHaveContent('.a{height:100%}.b{width:100%}', done);
        });

        it("should generate a manifest index containing the different minifications for js and css ", function (done) {
            expect('target/css.json').toHaveSameParsedContentAs('test/expected/css.json', done);
        });
    });

    describe("copy files", function () {
        it("should copy the files included in aggregation target/all", function (done) {
            expect('target/aggregations/dir1/subdir1_1/a.js').toExist();
            expect('target/aggregations/dir1/subdir1_1/b.js').toExist();
            expect('target/aggregations/dir1/subdir1_2/a.js').toExist();
            expect('target/aggregations/dir2/a.js').toExist();
            expect('target/aggregations/dir2/b.js').toExist();
            expect('target/aggregations/dir1/subdir1_1/exclude.js').not.toExist();
            expect('target/aggregations/dir1/subdir1_1/mod.json').not.toExist();
            expect('target/aggregations/dir1/subdir1_2/mod.json').not.toExist();
            done();
        });

        it("should copy the files included in aggregation target/aggregations/dir1", function (done) {
            expect('target/aggregations/dir1/subdir1_1/a.js').toExist();
            expect('target/aggregations/dir1/subdir1_1/b.js').toExist();
            expect('target/aggregations/dir1/subdir1_2/a.js').toExist();
            expect('target/aggregations/dir1/subdir1_1/exclude.js').not.toExist();
            expect('target/aggregations/dir1/subdir1_1/mod.json').not.toExist();
            expect('target/aggregations/dir1/subdir1_2/mod.json').not.toExist();
            done();
        });

        it("should copy the files included in aggregation target/aggregations/all", function (done) {
            expect('target/aggregations/dir2/a.js').toExist();
            expect('target/aggregations/dir2/b.js').toExist();
            done();
        });

        it("should not copy files if the copy:false flag is used", function (done) {
            expect('target/no-copy/all.min.js').toExist();
            expect('target/no-copy/all').not.toExist();
            done();
        });
    });

    describe("listing files", function () {
        it("should create a manifest without copying or minifying aggregated files", function (done) {
            expect('target/list').not.toExist();
            expect('target/list.debug.json').toHaveSameParsedContentAs('test/expected/list.debug.json', done);
        });
        it("should create a copy of the manifest: list.copy.debug.json", function (done) {
            expect('target/list.copy.debug.json').toHaveSameParsedContentAs('target/list.debug.json', done);
        });
    });

    describe("manymin", function () {
        it("should create a manifest with same file names as the original files", function (done) {
            expect("target/manymin.debug.json").toHaveSameParsedContentAs("test/expected/manymin.json", done);
        });

        it("should minify the files content (a.js)", function (done) {
            expect("target/manymin/a.js").toHaveContent("var a=1;", done);
        });

        it("should minify the files content (b.js)", function (done) {
            expect("target/manymin/b.js").toHaveContent("var b=2;", done);
        });
    });
});

beforeEach(function () {
    this.addMatchers(
        {
            toExist:function () {
                return fs.existsSync(this.actual);
            },

            toEqual:function (expected) {
                var messages = '';

                function addMismatch(messagePrefix, message) {
                    messagePrefix = messagePrefix || '';
                    messages = messages + messagePrefix + ": " + message + '\n';
                    return false;
                }

                function isEqual(actual, expected, messagePrefix) {
                    if (typeof actual !== typeof expected) {
                        return addMismatch(messagePrefix, "type mismatch: actual is " + typeof actual + " expected is " + typeof expected);
                    }
                    if (actual instanceof Array) {
                        if (!(expected instanceof Array)) {
                            return addMismatch(messagePrefix, "type mismatch: actual is Array, expected is not an Array");
                        }
                        return isEqualArray(actual, expected, messagePrefix);
                    }
                    if (typeof actual === 'object') {
                        return isEqualObject(actual, expected, messagePrefix);
                    }
                    if (actual !== expected) {
                        return addMismatch(messagePrefix, 'value mismatch: actual is "' + actual + '", expected is "' + expected + '"');
                    }
                    return true;
                }

                function isEqualArray(actual, expected, messagePrefix) {
                    if (actual.length !== expected.length) {
                        return addMismatch(messagePrefix, "array size mismatch");
                    }
                    var pass = true;
                    actual.forEach(function (item, index) {
                        pass = pass && isEqual(actual[index], expected[index], messagePrefix + '[' + index + ']');
                    });
                    return pass;
                }

                function isEqualObject(actual, expected, messagePrefix) {
                    var pass = true;
                    var aKeys = Object.keys(actual);
                    var bKeys = Object.keys(expected);
                    aKeys.forEach(function (key) {
                        if (bKeys.indexOf(key) === -1) {
                            addMismatch(messagePrefix, 'key mismatch: "' + key + '" is missing from expected');
                            pass = false;
                        }
                    });
                    bKeys.forEach(function (key) {
                        if (aKeys.indexOf(key) === -1) {
                            addMismatch(messagePrefix, 'key mismatch: "' + key + '" is missing from actual');
                            pass = false;
                        }
                    });
                    if (!pass) {
                        return false;
                    }
                    aKeys.forEach(function (key) {
                        pass = pass && isEqual(actual[key], expected[key], messagePrefix + '.' + key);
                    });
                    return pass;
                }

                this.message = function () {
                    return messages;
                };
                return isEqual(this.actual, expected, '{root}');
            },

            toHaveParsedContent:function (content, done) {
                var fileName = this.actual;
                readFile(this.actual, 'utf8', function (err, data) {
                    if (!err && data) {
                        expect(JSON.parse(data)).toEqual(content);
                        done();
                    } else {
                        done("Error reading file: " + fileName);
                    }

                });
                return true;
            },

            toHaveSameParsedContentAs:function (expectedResultFile, done) {
                var actual = this.actual;
                var content = {};

                function checkContent() {
                    if (actual in content && expectedResultFile in content) {
                        expect(content[actual]).toEqual(content[expectedResultFile]);
                        done();
                    }
                }

                function read(file) {
                    readFile(file, 'utf8', function (err, data) {
                        if (!err && data) {
                            try {
                                content[file] = JSON.parse(data);
                                checkContent();
                            } catch (err) {
                                done('Error parsing content of ' + file);
                            }
                        } else {
                            done("Error reading file: " + file + "\n" + err);
                        }
                    });
                }

                read(actual);
                read(expectedResultFile);
                return true;
            },

            toHaveContent:function (content, done) {
                var fileName = this.actual;
                readFile(fileName, 'utf8', function (err, data) {
                    if (!err && data) {
                        expect(data).toEqual(content);
                        done();
                    } else {
                        done("Error reading file: " + fileName);
                    }

                });
                return true;
            }
        }
    );
});
