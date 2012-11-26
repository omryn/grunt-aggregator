'use strict';
var readFileSync = require('fs').readFileSync;

describe("Aggregation manifest grunt plugin", function () {
    describe("manifest loading", function () {
        it("should load aggregations.json", function (done) {
            var data = readFileSync('./target/index.json', 'utf8');
            expect(JSON.parse(data)).toEqual(
                    {"dir1.js":{
                        "src":["test/resources/dir1/subdir1_1/a.js", "test/resources/dir1/subdir1_1/b.js", "test/resources/dir1/subdir1_2/a.js"],
                        "dest":"target/dir1.js"
                    }, "dir2.js":{
                        "src":["test/resources/dir2/a.js", "test/resources/dir2/b.js"],
                        "dest":"target/dir2.js"
                    }, "all.js":{
                        "src":["test/resources/dir1/subdir1_1/a.js", "test/resources/dir1/subdir1_1/b.js", "test/resources/dir1/subdir1_2/a.js", "test/resources/dir2/a.js", "test/resources/dir2/b.js"],
                        "dest":"target/all.js"
                    }});
            done();
        });

        it("should minify & concat all.js", function (done) {
            var data = readFileSync('./target/all.js', 'utf8');
            expect(data).toBe('1,2,3,4,5;');
            done();
        });

        it("should minify & concat dir1.js", function (done) {
            var data = readFileSync('./target/dir1.js', 'utf8');
            expect(data).toBe('1,2,3;');
            done();
        });

        it("should minify & concat dir2.js", function (done) {
            var data = readFileSync('target/dir2.js', 'utf8');
            expect(data).toBe('4,5;');
            done();
        });
    });
});
