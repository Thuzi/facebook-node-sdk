'use strict';
import FBdefault, {FB, Facebook} from '../..';
var expect = require('chai').expect,
	omit = require('lodash.omit'),
	defaultOptions = omit(FB.options());

beforeEach(function() {
	FB.options(defaultOptions);
});

afterEach(function() {
	FB.options(defaultOptions);
});

describe('FB.extend', function() {
	describe('FB.extend()', function() {
		it('should create a Facebook instance', function() {
			var fb = FB.extend();
			expect(fb).to.be.instanceof(Facebook);
		});

		it('should not be the same instance as FB', function() {
			var fb = FB.extend();
			expect(fb).to.not.equal(FBdefault)
				.and.to.not.equal(FB);
		});
	});

	describe("FB.extend({appId: '42'})", function() {
		it('should set options passed to it', function() {
			var fb = FB.extend({appId: '42'});
			expect(fb.options('appId')).to.equal('42');
		});

		it('should inherit other options from FB', function() {
			FB.options({appSecret: 'the_secret'});
			var fb = FB.extend({appId: '42'});
			expect(fb.options('appSecret')).to.equal(FB.options('appSecret'));
		});

		it('should inherit options from FB set after its creation', function() {
			FB.options({appSecret: 'the_secret'});
			var fb = FB.extend({appId: '42'});
			FB.options({appSecret: 'another_secret'});
			expect(fb.options('appSecret')).to.equal('another_secret');
		});
	});

	describe("fb.extend({appId: '42'})", function() {
		it('should work on an instance made by `new Facebook()` like it does on `FB`', function() {
			var fb = new Facebook(),
				fb2 = fb.extend({appId: '42'});

			expect(fb2).to.not.equal(fb);
			expect(fb.options('appId')).to.not.equal('42');
			expect(fb2.options('appId')).to.equal('42');
		});
	});

	describe("FB.withAccessToken('access_token')", function() {
		it('should create a new instance with accessToken set', function() {
			var fb = FB.withAccessToken('access_token');
			expect(fb).to.not.equal(FB);
			expect(fb.options('accessToken')).to.equal('access_token');
			expect(FB.options('accessToken')).to.not.equal(fb.options('accessToken'));
		});
	});
});
