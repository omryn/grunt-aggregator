var readFileSync = require('fs').readFileSync;
var fs = require('fs');

function copyFile(from, to){
    fs.writeFileSync(to, fs.readFileSync(from, 'utf8'));
}

describe("FileModifier", function () {
    var origPath='test/resources/greatescape/original.js';
    var escapedPath='test/resources/greatescape/escaped.js';
    var original =(readFileSync(origPath, 'utf8'));
    var escaped = (readFileSync(escapedPath, 'utf8'));
    var escapedText = "'use strict';function theRest(){var nya='\\\"meow\\\"';var wuff='\\\"=^.^=\\\"';var meowWuff='\\\'^>.<^\\\'';return{nya:[nya,wuff,meowWuff]};}";

    // cleanup after test
    copyFile(origPath,escapedPath);


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


