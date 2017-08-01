'use strict';
var Bluebird = require('bluebird'),
	nock = require('nock'),
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
	describe('GET', function() {
		describe("FB.api('4', cb)", function() {
			beforeEach(function() {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4')
					.reply(200, {
						id: '4',
						name: 'Mark Zuckerberg',
						first_name: 'Mark',
						last_name: 'Zuckerberg',
						link: 'http://www.facebook.com/zuck',
						gender: 'male',
						locale: 'en_US'
					});
			});

			it('should have id 4', function(done) {
				FB.api('4', function(result) {
					notError(result);
					expect(result).to.have.property('id', '4');
					done();
				});
			});
		});

		describe("FB.api('/4', cb)", function() {
			it('should have id 4', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4')
					.reply(200, {
						id: '4',
						name: 'Mark Zuckerberg',
						first_name: 'Mark',
						last_name: 'Zuckerberg',
						link: 'http://www.facebook.com/zuck',
						username: 'zuck',
						gender: 'male',
						locale: 'en_US'
					});

				FB.api('/4', function(result) {
					notError(result);
					expect(result).to.have.property('id', '4');
					done();
				});
			});

			it('should work without `this`', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4')
					.reply(200, {
						id: '4',
						name: 'Mark Zuckerberg',
						first_name: 'Mark',
						last_name: 'Zuckerberg',
						link: 'http://www.facebook.com/zuck',
						username: 'zuck',
						gender: 'male',
						locale: 'en_US'
					});

				FB.api.call(undefined, '/4', function(result) {
					notError(result);
					expect(result).to.have.property('id', '4');
					done();
				});
			});
		});

		describe('FB.api(4, cb)', function() {
			// this is the default behavior of client side js sdk
			it('should throw synchronously: Path is of type number, not string', function(done) {
				try {
					FB.api(4, function() {
					});

					done(new Error('Passing in a number should throw an exception'));
				} catch (e) {
					done();
				}
			});
		});

		describe("FB.api('4', { fields: 'id' }), cb)", function() {
			it("should return { id: '4' } object", function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4?fields=id')
					.reply(200, {
						id: '4'
					});

				FB.api('4', {fields: 'id'}, function(result) {
					notError(result);
					expect(result).to.include({id: '4'});
					done();
				});
			});
		});

		describe("FB.api('/4?fields=name', cb)", function() {
			it("should return { id: '4', name: 'Mark Zuckerberg' } object", function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4?fields=name')
					.reply(200, {
						name: 'Mark Zuckerberg',
						id: '4'
					});

				FB.api('/4?fields=name', function(result) {
					notError(result);
					expect(result).to.have.keys('id', 'name')
						.and.include({id: '4', name: 'Mark Zuckerberg'});
					done();
				});
			});
		});

		describe("FB.api('/', { object: { a: false, b: 2, c: 'cat' } }), cb)", function() {
			it('should serialize object parameter values to json ?object={"a":false,"b":2,"c":"cat"}', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4?object=%7B%22a%22%3Afalse%2C%22b%22%3A2%2C%22c%22%3A%22cat%22%7D')
					.reply(200, {
					});

				FB.api('4', {object: {a: false, b: 2, c: 'cat'}}, function(result) {
					notError(result);
					done();
				});
			});
		});

		describe("FB.api('/', { array: [false, 2, 'c'] }), cb)", function() {
			it('should serialize array parameter values to json ?array=[false,2,"c"]', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4?array=%5Bfalse%2C2%2C%22c%22%5D')
					.reply(200, {
					});

				FB.api('4', {array: [false, 2, 'c']}, function(result) {
					notError(result);
					done();
				});
			});
		});

		describe("FB.api('/4?fields=name', { fields: 'id,first_name' }, cb)", function() {
			it("should return { id: '4', name: 'Mark Zuckerberg' } object", function(done) {
				var expectedRequest = nock('https://graph.facebook.com:443')
					.get('/v2.3/4?fields=id%2Cname')
					.reply(200, {
						id: '4',
						name: 'Mark Zuckerberg'
					});

				FB.api('4?fields=name', {fields: 'id,name'}, function(result) {
					notError(result);
					expectedRequest.done();
					expect(result).to.include({id: '4', name: 'Mark Zuckerberg'});
					done();
				});
			});
		});

	});

	describe('oauth', function() {
		describe("FB.api('oauth/access_token', { ..., grant_type: 'client_credentials' }, cb)", function() {
			it("should return an { access_token: '...' } object", function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/oauth/access_token')
					.query({
						client_id: 'app_id',
						client_secret: 'app_secret',
						grant_type: 'client_credentials'
					})
					.reply(200, {
						access_token: '...',
					});

				FB.api('oauth/access_token', {
					client_id: 'app_id',
					client_secret: 'app_secret',
					grant_type: 'client_credentials'
				}, function(result) {
					notError(result);
					expect(result).to.have.keys('access_token')
						.and.include({access_token: '...'});
					done();
				});
			});
		});

		describe("FB.api('oauth/access_token', { grant_type: 'fb_exchange_token', ..., fb_exchange_token: ... }, cb)", function() {
			it('should return an object with expires as a number', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/oauth/access_token')
					.query({
						grant_type: 'fb_exchange_token',
						client_id: 'app_id',
						client_secret: 'app_secret',
						fb_exchange_token: 'access_token'
					})
					.reply(200, {
						access_token: '...',
						expires_in: 99999,
					});

				FB.api('oauth/access_token', {
					grant_type: 'fb_exchange_token',
					client_id: 'app_id',
					client_secret: 'app_secret',
					fb_exchange_token: 'access_token'
				}, function(result) {
					notError(result);
					expect(result).to.have.property('expires_in')
						.and.be.a('number')
						.and.equal(99999);
					done();
				});
			});
		});
	});
});

describe('FB.api', function() {
	describe('GET', function() {
		describe("FB.napi('/4', cb)", function() {
			it('should have id 4', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4')
					.reply(200, {
						id: '4',
						name: 'Mark Zuckerberg',
						first_name: 'Mark',
						last_name: 'Zuckerberg',
						link: 'http://www.facebook.com/zuck',
						username: 'zuck',
						gender: 'male',
						locale: 'en_US'
					});

				FB.napi('/4', function(err, result) {
					notError(result);
					expect(result).to.have.property('id', '4');
					done();
				});
			});

			it('should work without `this`', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4')
					.reply(200, {
						id: '4',
						name: 'Mark Zuckerberg',
						first_name: 'Mark',
						last_name: 'Zuckerberg',
						link: 'http://www.facebook.com/zuck',
						username: 'zuck',
						gender: 'male',
						locale: 'en_US'
					});

				FB.napi.call(undefined, '/4', function(err, result) {
					notError(result);
					expect(result).to.have.property('id', '4');
					done();
				});
			});
		});

		describe("FB.api('/4')", function() {
			it('should return a Promise', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4')
					.reply(200, {
						id: '4',
						name: 'Mark Zuckerberg',
						first_name: 'Mark',
						last_name: 'Zuckerberg',
						link: 'http://www.facebook.com/zuck',
						username: 'zuck',
						gender: 'male',
						locale: 'en_US'
					});

				var ret = FB.api('/4');

				expect(ret).to.have.property('then').that.is.a('function');
				expect(ret).to.have.property('catch').that.is.a('function');
				expect(ret).to.be.an.instanceof(require('any-promise'));
				ret
					.then((result) => {
						expect(result).to.have.property('id', '4');
						done();
					});
			});

			it('should work when the Promise option is native Promise', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4')
					.reply(200, {
						id: '4',
						name: 'Mark Zuckerberg',
						first_name: 'Mark',
						last_name: 'Zuckerberg',
						link: 'http://www.facebook.com/zuck',
						username: 'zuck',
						gender: 'male',
						locale: 'en_US'
					});

				var fb = new FB.Facebook({Promise: Promise});
				var ret = fb.api('/4');

				expect(ret).to.have.property('then').that.is.a('function');
				expect(ret).to.have.property('catch').that.is.a('function');
				expect(ret).to.be.an.instanceof(Promise);
				ret
					.then((result) => {
						expect(result).to.have.property('id', '4');
						done();
					});
			});

			it('should work when the Promise option is Bluebird', function(done) {
				nock('https://graph.facebook.com:443')
					.get('/v2.3/4')
					.reply(200, {
						id: '4',
						name: 'Mark Zuckerberg',
						first_name: 'Mark',
						last_name: 'Zuckerberg',
						link: 'http://www.facebook.com/zuck',
						username: 'zuck',
						gender: 'male',
						locale: 'en_US'
					});

				var fb = new FB.Facebook({Promise: Bluebird});
				var ret = fb.api('/4');

				expect(ret).to.have.property('then').that.is.a('function');
				expect(ret).to.have.property('catch').that.is.a('function');
				expect(ret).to.be.an.instanceof(Bluebird);
				ret
					.then((result) => {
						expect(result).to.have.property('id', '4');
						done();
					});
			});
		});
	});
});
