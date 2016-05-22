'use strict';
var nock = require('nock'),
	expect = require('chai').expect,
	FB = require('../..'),
	omit = require('lodash.omit'),
	defaultOptions = omit(FB.options(), 'appId');

nock.disableNetConnect();

beforeEach(function() {
	FB.options(defaultOptions);
});

afterEach(function() {
	nock.cleanAll();
	FB.options(defaultOptions);
});

describe('FB.getLoginUrl', function() {
	var base = 'https://www.facebook.com/v2.1/dialog/oauth';
	describe('when no options are set', function() {
		describe('FB.getLoginUrl({}})', function() {
			it('should throw', function() {
				expect(function() { return FB.getLoginUrl({}); }).to.throw;
			});
		});

		describe("FB.getLoginUrl({ appId: 'app_id' }})", function() {
			var url = base + '?response_type=code&redirect_uri=https%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({appId: 'app_id'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id' }})", function() {
			var url = base + '?response_type=code&redirect_uri=https%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id', scope: 'email' }})", function() {
			var url = base + '?response_type=code&scope=email&redirect_uri=https%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id', scope: 'email'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id', state: 'state_data' }})", function() {
			var url = base + '?response_type=code&state=state_data&redirect_uri=https%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id', state: 'state_data'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id', redirectUri: 'http://example.com/' }})", function() {
			var url = base + '?response_type=code&redirect_uri=http%3A%2F%2Fexample.com%2F&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id', redirectUri: 'http://example.com/'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id', redirect_uri: 'http://example.com/' }})", function() {
			var url = base + '?response_type=code&redirect_uri=http%3A%2F%2Fexample.com%2F&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id', redirect_uri: 'http://example.com/'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id', display: 'popup' }})", function() {
			var url = base + '?response_type=code&display=popup&redirect_uri=https%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id', display: 'popup'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id', responseType: 'token' }})", function() {
			var url = base + '?response_type=token&redirect_uri=https%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id', responseType: 'token'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id', response_type: 'token' }})", function() {
			var url = base + '?response_type=token&redirect_uri=https%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id', response_type: 'token'}))
					.to.equal(url);
			});
		});
	});

	describe('when the redirectUri option is set to http://example.com/', function() {
		beforeEach(function() {
			FB.options({redirectUri: 'http://example.com/'});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id' }})", function() {
			var url = base + '?response_type=code&redirect_uri=http%3A%2F%2Fexample.com%2F&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id', redirectUri: 'http://example.org/' }})", function() {
			var url = base + '?response_type=code&redirect_uri=http%3A%2F%2Fexample.org%2F&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id', redirectUri: 'http://example.org/'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id', redirect_uri: 'http://example.org/' }})", function() {
			var url = base + '?response_type=code&redirect_uri=http%3A%2F%2Fexample.org%2F&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id', redirect_uri: 'http://example.org/'}))
					.to.equal(url);
			});
		});
	});

	describe("when the scope option is set to 'email'", function() {
		beforeEach(function() {
			FB.options({scope: 'email'});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id' }})", function() {
			var url = base + '?response_type=code&scope=email&redirect_uri=https%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id'}))
					.to.equal(url);
			});
		});

		describe("FB.getLoginUrl({ client_id: 'app_id', scope: 'email,user_likes' }})", function() {
			var url = base + '?response_type=code&scope=email%2Cuser_likes&redirect_uri=https%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html&client_id=app_id';
			it('should equal ' + url, function() {
				expect(FB.getLoginUrl({client_id: 'app_id', scope: 'email,user_likes'}))
					.to.equal(url);
			});
		});
	});
});
