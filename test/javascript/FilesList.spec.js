'use strict';
var readFileSync = require('fs').readFileSync;

describe("FilesList", function () {
    it("should create a list of all the json files in resources", function (done) {
        var actual = JSON.parse(readFileSync('target/manifest.json'));
        expect(actual).toEqual([
            {
                "url":"test/resources",
                "id":"test/resources",
                "resources":[
                    {
                        "url":"dir1/subdir1_1/mod.json",
                        "id":"dir1.subdir1_1.mod.json"
                    },
                    {
                        "url":"dir1/subdir1_2/mod.json",
                        "id":"dir1.subdir1_2.mod.json"
                    },
                    {
                        "url":"dir2/a.js"
                    },
                    {
                        "url":"dir2/b.js"
                    }
                ]
            }
        ]);
        done();
    });
});