describe("manifest grunt plugin", function () {
    describe("manifest loading", function () {
        it("should load aggregations.json", function (done) {
            expect(require('fs').readJSON('target/index.json')).toEqual({
                "dir1":{
                    "src":["test/resources/dir1/subdir1_1/a.js", "test/resources/dir1/subdir1_1/b.js", "test/resources/dir1/subdir1_2/a.js"],
                    "dest":"dir1"
                }, "dir2":{
                    "src":["test/resources/dir2/a.js", "test/resources/dir2/b.js"],
                    "dest":"dir2"
                }, "all":{
                    "src":["test/resources/dir1/subdir1_1/a.js", "test/resources/dir1/subdir1_1/b.js", "test/resources/dir1/subdir1_2/a.js", "test/resources/dir2/a.js", "test/resources/dir2/b.js"],
                    "dest":"all"
                }});
            done();
        });

        it("should load aggregations.json", function (done) {
            expect(require('fs').readFileSync('target/all.js')).toEqual('1,2,3,4,5;');
            done();
        });

        it("should load aggregations.json", function (done) {
            expect(require('fs').readFileSync('target/dir1.js')).toEqual('1,2,3;');
            done();
        });

        it("should load aggregations.json", function (done) {
            expect(require('fs').readFileSync('target/dir2.js')).toEqual('4,5;');
            done();
        });
    });
});
