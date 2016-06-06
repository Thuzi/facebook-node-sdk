'use strict';
import FBdefault, {FB, FacebookApiException as FacebookApiExceptionImport} from '../..';
var FacebookApiException = require('../../lib/FacebookApiException').default,
	nock = require('nock'),
	expect = require('chai').expect,
	notError = require('../_supports/notError'),
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

describe('import', function() {
	describe("import FB from 'fb';", function() {
		it('should expose FB.api', function() {
			expect(FBdefault).property('api')
				.to.be.a('function');
		});

		it('FB.api should work without `this`', function(done) {
			nock('https://graph.facebook.com:443')
				.get('/v2.0/4')
				.reply(200, {
					id: '4'
				});

			FBdefault.api.call(undefined, '/4', function(result) {
				notError(result);
				expect(result).to.have.property('id', '4');
				done();
			});
		});

		it('should expose a legacy FB.FacebookApiException', function() {
			expect(FBdefault.FacebookApiException).to.equal(FacebookApiException);
		});
	});

	describe("import {FB} from 'fb';", function() {
		it('should expose FB.api', function() {
			expect(FB).property('api')
				.to.be.a('function');
		});

		it('FB.api should work without `this`', function(done) {
			nock('https://graph.facebook.com:443')
				.get('/v2.0/4')
				.reply(200, {
					id: '4'
				});

			FB.api.call(undefined, '/4', function(result) {
				notError(result);
				expect(result).to.have.property('id', '4');
				done();
			});
		});
	});

	describe("import {FacebookApiException} from 'fb';", function() {
		it('should expose the FacebookApiException eror typei', function() {
			expect(FacebookApiExceptionImport).to.equal(FacebookApiException);
		});
	});
});
