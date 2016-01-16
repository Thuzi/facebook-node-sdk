'use strict';
var FB = require('../..'),
	FacebookApiException = require('../../lib/FacebookApiException'),
	{version} = require('../../package.json'),
	expect = require('chai').expect;

describe('FB.FacebookApiException', function() {
	it('should be a function', function() {
		expect(FB.FacebookApiException)
			.to.exist
			.and.to.be.a('function');
	});

	it('should create a FacebookApiExceptionn instance that derives from Error', function() {
		var obj = {};
		expect(new FB.FacebookApiException(obj))
			.to.be.an.instanceof(FacebookApiException)
			.and.to.be.an.instanceof(Error)
			.and.to.include({
				name: 'FacebookApiException',
				message: '{}',
				response: obj
			});
	});
});

describe('FB.version', function() {
	it("should be a string with this package's current version", function() {
		expect(FB.version)
			.to.be.a('string')
			.and.to.equal(version);
	});
});
