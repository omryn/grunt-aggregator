var readFileSync = require('fs').readFileSync;

describe("GreatEscape", function() {
	var origPath = 'test/greatescape/original.js';
	var escapedPath = 'target/aggregations/greatescape/escaped.js';
	var original = (readFileSync(origPath, 'utf8'));
	var escaped = (readFileSync(escapedPath, 'utf8'));
	var escapedText = "\n\\\"use strict\\\"\n\nwindow.theRest = function (){\n    var nya = '\\\"meow\\\"';\n    var wuff = '\\\\\\\"=^.^=\\\\\\\"';\n    var meowWuff = \\\"\\\\'^>.<^\\\\'\\\";\n\n    return {\n        nya: [\n            nya, wuff, meowWuff\n        ]\n    }\n}\n\n\n\n\n\n\n";

	it("should escape the file content", function(done) {
		expect(escaped.replace(/[\s\t]*/g, '').replace(/\\n/g, '')).toBe(escapedText.replace(/[\r\n\s]*/g, ''));
		done();
	});
});
