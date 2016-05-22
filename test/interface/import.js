'use strict';
import FBdefault, {FB, FacebookApiException as FacebookApiExceptionImport} from '../..';
var FacebookApiException = require('../../lib/FacebookApiException').default,
	expect = require('chai').expect;

describe('import', function() {
	describe("import FB from 'fb';", function() {
		it('should expose FB.api', function() {
			expect(FBdefault).property('api')
				.to.be.a('function');
		});
	});

	describe("import {FB} from 'fb';", function() {
		it('should expose FB.api', function() {
			expect(FB).property('api')
				.to.be.a('function');
		});
	});

	describe("import {FacebookApiException} from 'fb';", function() {
		it('should expose the FacebookApiException eror typei', function() {
			expect(FacebookApiExceptionImport).to.equal(FacebookApiException);
		});
	});
});
