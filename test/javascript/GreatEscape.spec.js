"use strict";
var readFileSync = require('fs').readFileSync;

describe("FileModifier", function () {
    var origPath='test/resources/greatescape/original.js';
    var escapedPath='target/aggregations/greatescape/escaped.js';
    var original =(readFileSync(origPath, 'utf8'));
    var escaped = (readFileSync(escapedPath, 'utf8'));
    var escapedText = "'use strict';function theRest(){var nya='\\\"meow\\\"';var wuff='\\\"=^.^=\\\"';var meowWuff='\\\'^>.<^\\\'';return{nya:[nya,wuff,meowWuff]};}";

    it("should escape the file content", function (done) {
        expect(escaped).toBe(escapedText);
        done();
    });

//    it("should escape the file content", function (done) {
//        var savedFunction = eval(escaped);
//        console.log(savedFunction);
//        var result = theRest();
//        expect(escaped).toBe({nya:['"meow"', '\"=^.^=\"',"\'^>.<^\'"]});
//        done();
//    })
});


