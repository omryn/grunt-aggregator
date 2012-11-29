'use strict';
var fs = require('fs');
var readFile = fs.readFile;

jasmine.Matchers.prototype.toExist = function () {
    return fs.existsSync(this.actual);
};

jasmine.Matchers.prototype.toHaveParsedContent = function (content, done) {
    readFile(this.actual, 'utf8', function (err, data) {
        expect(err).toBeFalsy();
        expect(JSON.parse(data)).toEqual(content);
        done();
    });
};

jasmine.Matchers.prototype.toHaveContent = function (content, done) {
    readFile(this.actual, 'utf8', function (err, data) {
        expect(err).toBeFalsy();
        expect(data).toEqual(content);
        done();
    });
};

describe("Aggregation manifest grunt plugin", function () {
    describe("manifest files", function () {
        it("should generate a manifest.json file", function (done) {
            expect('./target/manifest.json').toHaveParsedContent([
                { "id":"dir1", "url":"target/dir1.min.js" },
                { "id":"dir2", "url":"target/dir2.min.js" },
                { "id":"all", "url":"target/all.min.js" }
            ], done);
        });
    });

    it("should generate a manifest.debug.json file", function (done) {
        expect('./target/manifest.debug.json').toHaveParsedContent([
            { "url":"target/dir1", "id":"dir1", "resources":[
                {"url":"subdir1_1/a.js"},
                {"url":"subdir1_1/b.js"},
                {"url":"subdir1_2/a.js"}
            ] },
            { "url":"target/dir2", "id":"dir2", "resources":[
                {"url":"a.js"},
                { "url":"b.js" }
            ] },
            { "url":"target/all", "id":"all", "resources":[
                { "url":"dir1/subdir1_1/a.js" },
                { "url":"dir1/subdir1_1/b.js" },
                { "url":"dir1/subdir1_2/a.js" },
                { "url":"dir2/a.js" },
                { "url":"dir2/b.js" }
            ] }
        ], done);
    });
});

describe("copy files", function () {
    it("should copy the files included in aggregation target/all", function () {
        expect('target/all/dir1/subdir1_1/a.js').toExist();
        expect('target/all/dir1/subdir1_1/b.js').toExist();
        expect('target/all/dir1/subdir1_2/a.js').toExist();
        expect('target/all/dir2/a.js').toExist();
        expect('target/all/dir2/b.js').toExist();
        expect('target/all/dir1/subdir1_1/exclude.js').not.toExist();
        expect('target/all/dir1/subdir1_1/mod.json').not.toExist();
        expect('target/all/dir1/subdir1_2/mod.json').not.toExist();
    });

    it("should copy the files included in aggregation target/dir1", function () {
        expect('target/all/dir1/subdir1_1/a.js').toExist();
        expect('target/all/dir1/subdir1_1/b.js').toExist();
        expect('target/all/dir1/subdir1_2/a.js').toExist();
        expect('target/all/dir1/subdir1_1/exclude.js').not.toExist();
        expect('target/all/dir1/subdir1_1/mod.json').not.toExist();
        expect('target/all/dir1/subdir1_2/mod.json').not.toExist();
    });

    it("should copy the files included in aggregation target/all", function () {
        expect('target/all/dir2/a.js').toExist();
        expect('target/all/dir2/b.js').toExist();
    });
});

describe("minify", function () {
    it("should minify & concat all.min.js as defined in aggregations.json", function (done) {
        expect('./target/all.min.js').toHaveContent('1,2,3,4,5;', done);
    });

    it("should minify & concat dir1.min.js as defined in aggregations.json", function (done) {
        expect('./target/dir1.min.js').toHaveContent('1,2,3;', done);
    });

    it("should minify & concat dir2.min.js as defined in aggregations.json", function (done) {
        expect('./target/dir2.min.js').toHaveContent('4,5;', done);
    });
});