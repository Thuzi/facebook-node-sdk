var expect = require('chai').expect;

module.exports = function(result) {
	expect(result.error && result.error.Error).to.not.exist;
	expect(result.error).to.not.be.instanceof(Error);
};
