'use strict';
var nock = require('nock'),
	expect = require('chai').expect,
	notError = require('../_supports/notError'),
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

describe('FB.api', function() {
	describe('headers', function() {
		describe('FB.getAppUsage()', function() {
			it('should be updated', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4')
					.reply(200, {}, {
						'X-App-Usage': '{"call_count":50, "total_time":60, "total_cputime":70}'
					});

				FB.api('4', function(result) {
					notError(result);
					let appUsage = FB.getAppUsage();
					expect(appUsage).to.have.property('callCount', 50);
					expect(appUsage).to.have.property('totalTime', 60);
					expect(appUsage).to.have.property('totalCPUTime', 70);
					done();
				});
			});

			it('should be set back to 0 if no header sent', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/5')
					.reply(200, {});

				FB.api('5', function(result) {
					notError(result);
					let appUsage = FB.getAppUsage();
					expect(appUsage).to.have.property('callCount', 0);
					expect(appUsage).to.have.property('totalTime', 0);
					expect(appUsage).to.have.property('totalCPUTime', 0);
					done();
				});
			});
		});

		describe('FB.getPageUsage()', function() {
			it('should be updated', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4')
					.reply(200, {}, {
						'X-Page-Usage': '{"call_count":10, "total_time":20, "total_cputime":30}'
					});

				FB.api('4', function(result) {
					notError(result);
					let pageUsage = FB.getPageUsage();
					expect(pageUsage).to.have.property('callCount', 10);
					expect(pageUsage).to.have.property('totalTime', 20);
					expect(pageUsage).to.have.property('totalCPUTime', 30);
					done();
				});
			});

			it('should be set back to 0 if no header sent', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/5')
					.reply(200, {});
				FB.api('5', function(result) {
					notError(result);
					let pageUsage = FB.getPageUsage();
					expect(pageUsage).to.have.property('callCount', 0);
					expect(pageUsage).to.have.property('totalTime', 0);
					expect(pageUsage).to.have.property('totalCPUTime', 0);
					done();
				});
			});
		});
	});
});
