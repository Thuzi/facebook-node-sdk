"use strict";
var expect = require('chai').expect,
    FB = require('../..'),
    omit = require('lodash.omit'),
    defaultOptions = omit(FB.options(), 'appId'),
	signature = 'U0_O1MqqNKUt32633zAkdd2Ce-jGVgRgJeRauyx_zC8',
	app_secret = 'foo_app_secret',
	payload = 'eyJvYXV0aF90b2tlbiI6ImZvb190b2tlbiIsImFsZ29yaXRobSI6IkhNQUMtU0hBMjU2IiwiaXNzdWVkX2F0IjozMjEsImNvZGUiOiJmb29fY29kZSIsInN0YXRlIjoiZm9vX3N0YXRlIiwidXNlcl9pZCI6MTIzLCJmb28iOiJiYXIifQ==',
	payloadData = {
		oauth_token: 'foo_token',
		algorithm: 'HMAC-SHA256',
		issued_at: 321,
		code: 'foo_code',
		state: 'foo_state',
		user_id: 123,
		foo: 'bar'
	},
	signedRequest = signature + '.' + payload;

beforeEach(function () {
    FB.options(defaultOptions);
});

afterEach(function () {
    FB.options(defaultOptions);
});

describe("FB.parseSignedRequest", function () {
	describe("FB.parseSignedRequest(signedRequest, app_secret)", function () {
		describe("when app_secret is defined", function () {
			it("should decode the correct payload", function () {
				expect(FB.parseSignedRequest(signedRequest, app_secret)).to.exist
					.and.include(payloadData);
			});

			it("should prefer the app_secret argument over the appSecret option", function () {
				FB.options({appSecret: 'wrong_secret'});
				expect(FB.parseSignedRequest(signedRequest, app_secret)).to.exist
					.and.include(payloadData);
			});
		});

		describe("when signedRequest is undefined", function () {
			it("should return undefined", function () {
				expect(FB.parseSignedRequest(undefined, app_secret)).to.be.undefined;
			});
		});

		describe("when signedRequest is not two pieces separated by a .", function () {
			it("should return undefined", function () {
				expect(FB.parseSignedRequest('wrong', app_secret)).to.be.undefined;
			});
		});

		describe("when signedRequest is not base64 encoded", function () {
			it("should return undefined", function () {
				expect(FB.parseSignedRequest('wrong.token', app_secret)).to.be.undefined;
			});
		});

		describe("when signature is incorrect", function () {
			it("should return undefined", function () {
				expect(FB.parseSignedRequest('YmFkc2ln.' + payload, app_secret)).to.be.undefined;
			});
		});

		describe("when app_secret is undefined", function () {
			it("should use the appSecret option to decode the payload", function () {
				FB.options({appSecret: app_secret});
				expect(FB.parseSignedRequest(signedRequest)).to.exist
					.and.include(payloadData);
			});

			it("should throw when the appSecret option is not defined", function () {
				expect(function() { return FB.parseSignedRequest(signedRequest) }).to.throw;
			});
		});
	});
});
