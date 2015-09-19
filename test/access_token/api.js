var nock = require('nock'),
    expect = require('chai').expect,
    should = require('chai').should(),
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

describe('access_token', function() {

    describe("FB.setAccessToken('access_token')", function() {
        it("should set an access_token used by api calls", function(done) {
            FB.setAccessToken('access_token');

            var expectedRequest = nock('https://graph.facebook.com:443')
                .get('/v2.0/me')
                .query({
                    access_token: 'access_token',
                })
                .reply(200, {
                    id: "4",
                    name: "Mark Zuckerberg"
                });

            FB.api('/me', function(result) {
                expectedRequest.done();
                done();
            });

        });
    });

    describe("FB.api('/me', { access_token: 'access_token' }, cb)", function() {
        it('should override an access_token set with FB.setAccessToken()', function(done) {
            FB.setAccessToken('wrong_token');

            var expectedRequest = nock('https://graph.facebook.com:443')
                .get('/v2.0/me')
                .query({
                    access_token: 'access_token'
                })
                .reply(200, {
                    id: "4",
                    name: "Mark Zuckerberg"
                });

            FB.api('/me', { access_token: 'access_token' }, function(result) {
                expectedRequest.done();
                done();
            });
        });
    });

    describe("FB.getAccessToken()", function() {
        describe("when accessToken is not set", function() {
            it("should return null", function() {
                expect(FB.getAccessToken()).to.be.null;
            });
        });

        describe("when accessToken is set", function() {
            it("should return the access_token", function() {
                FB.setAccessToken('access_token');
                should.exist(FB.getAccessToken())
                FB.getAccessToken().should.equal('access_token');
            });
        });
    })

    describe("FB.api('/me', { access_token: 'access_token' }, cb)", function() {
        it('should include the correct appsecret_proof in the query', function(done) {
            FB.options({ appSecret: 'app_secret' });

            var expectedRequest = nock('https://graph.facebook.com:443')
                .get('/v2.0/me')
                .query({
                    access_token: 'access_token',
                    appsecret_proof: 'd52ddf968d622d8af8677906b7fbae09ac1f89f7cd5c1584b27544624cc23e5a'
                })
                .reply(200, {
                    id: "4",
                    name: "Mark Zuckerberg"
                });

            FB.api('/me', { access_token: 'access_token' }, function(result) {
                expectedRequest.done();
                done();
            });
        });
    });

});
