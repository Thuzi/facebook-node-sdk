'use strict';
var path = require('path'),
	fs = require('fs'),
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
	describe('POST', function() {
		describe("FB.api('me/feed', 'post', { message: 'My first post using facebook-node-sdk' }, cb)", function() {
			beforeEach(function() {
				nock('https://graph.facebook.com:443')
					.post('/v2.1/me/feed', 'message=My%20first%20post%20using%20facebook-node-sdk')
					.reply(200, function() {
						return {
							contentType: this.req.headers['content-type'],
							id: '4_14'
						};
					});
			});

			it('should have id 4_14', function(done) {
				FB.api('me/feed', 'post', {message: 'My first post using facebook-node-sdk'}, function(result) {
					notError(result);
					expect(result.contentType).to.equal('application/x-www-form-urlencoded');
					expect(result).to.have.property('id', '4_14');
					done();
				});
			});
		});

		describe("FB.api('path', 'post', { file: { value: new Buffer('...', 'utf8'), options: { contentType: 'text/plain' } }, cb)", function() {
			beforeEach(function() {
				nock('https://graph.facebook.com:443')
					.post('/v2.1/path')
					.reply(200, function(uri, body) {
						return {
							contentType: this.req.headers['content-type'],
							body: body
						};
					});
			});

			it("should upload a file containing '...'", function(done) {
				FB.api('path', 'post', {file: {value: new Buffer('...', 'utf8'), options: {contentType: 'text/plain'}}}, function(result) {
					notError(result);
					expect(result.contentType).to.match(/^multipart\/form-data; boundary=/);
					let [, boundary] = result.contentType.match(/boundary=(.+)/);
					expect(result.body).to.equal(`--${boundary}\r\nContent-Disposition: form-data; name="file"\r\nContent-Type: text/plain\r\n\r\n...\r\n--${boundary}--\r\n`);
					done();
				});
			});
		});

		describe("FB.api('path', 'post', { file: fs.createReadStream('./ellipsis.txt') }, cb)", function() {
			beforeEach(function() {
				nock('https://graph.facebook.com:443')
					.post('/v2.1/path')
					.reply(200, function(uri, body) {
						return {
							contentType: this.req.headers['content-type'],
							body: body
						};
					});
			});

			it("should upload a file containing '...'", function(done) {
				FB.api('path', 'post', {file: fs.createReadStream(path.join(__dirname, '../_fixtures/ellipsis.txt'))}, function(result) {
					notError(result);
					expect(result.contentType).to.match(/^multipart\/form-data; boundary=/);
					let [, boundary] = result.contentType.match(/boundary=(.+)/);
					expect(result.body).to.equal(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="ellipsis.txt"\r\nContent-Type: text/plain\r\n\r\n...\n\r\n--${boundary}--\r\n`);
					done();
				});
			});
		});
	});
});
