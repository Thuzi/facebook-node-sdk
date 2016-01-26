'use strict';
var nock = require('nock'),
	expect = require('chai').expect,
	FB = require('../..'),
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

describe('FB.api', function() {
	describe('batch', function() {

		describe("FB.api('', 'post', { batch: [ { method: 'get', relative_url: '4' }, { method: 'get', relative_url: 'me/friends?limit=50' } ], cb)", function() {
			beforeEach(function() {
				nock('https://graph.facebook.com:443')
					.post('/v2.1/', 'batch=%5B%7B%22method%22%3A%22get%22%2C%22relative_url%22%3A%224%22%7D%2C%7B%22method%22%3A%22get%22%2C%22relative_url%22%3A%22me%2Ffriends%3Flimit%3D50%22%7D%5D')
					.reply(200, [
						{
							code: 200,
							headers: [
								{
									name: 'Access-Control-Allow-Origin',
									value: '*'
								},
								{
									name: 'Content-Type',
									value: 'text/javascript; charset=UTF-8'
								},
								{
									name: 'Facebook-API-Version',
									value: 'v2.4'
								}
							],
							body: JSON.stringify({
								id: '4',
								name: 'Mark Zuckerberg'
							})
						},
						{
							code: 200,
							headers: [
								{
									name: 'Access-Control-Allow-Origin',
									value: '*'
								},
								{
									name: 'Content-Type',
									value: 'text/javascript; charset=UTF-8'
								},
								{
									name: 'Facebook-API-Version',
									value: 'v2.4'
								}
							],
							body: JSON.stringify({
								data: [],
								summary: {
									total_count: 0
								}
							})
						}
					]);
			});

			it('should return batch results', function(done) {
				FB.api('', 'post', {
					batch: [
						{method: 'get', relative_url: '4'},
						{method: 'get', relative_url: 'me/friends?limit=50'}
					]
				}, function(result) {
					notError(result);
					expect(result).to.be.a('array');
					expect(result[0]).to.have.property('code', 200);
					expect(result[1]).to.have.property('code', 200);
					done();
				});
			});
		});

	});
});
