'use strict';
describe("utils", function () {
    var utils = require('../../common/utils')(null);
    describe("unixpath", function () {
        it("should return a clean path", function (done) {
            expect(utils.unixpath("some//url/with/.././garbage/", "base/url///")).toEqual("base/url/some/url/garbage");
            done();
        });
        it("should convert windows paths to unix style path", function (done) {
            expect(utils.unixpath("some\\\\url/with\\.././garbage/", "base/url///")).toEqual("base/url/some/url/garbage");
            done();
        });
    });
});