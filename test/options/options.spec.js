var FB = require('../..'),
    nock = require('nock'),
    should = require('chai').should(),
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

describe('FB.options', function() {

    describe('beta', function() {
        it('Should default beta to false', function() {
            FB.options('beta').should.be.false;
        });

        it('Should allow beta option to be set', function() {
            FB.options({ beta: true });

            FB.options('beta').should.be.true;

            FB.options({ beta: false });

            FB.options('beta').should.be.false;
        });

        it('Should make use graph.facebook when beta is false', function(done) {
            var expectedRequest = nock('https://graph.facebook.com:443').get('/v2.0/4').reply(200, {});

            FB.options({ beta: false });

            FB.api('/4', function(result) {
                should.not.exist(result.error && result.error.Error);
                expectedRequest.done(); // verify non-beta request was made

                done();
            });
        });

        it('Should make use graph.beta.facebook when beta is true', function(done) {
            var expectedRequest = nock('https://graph.beta.facebook.com:443').get('/v2.0/4').reply(200, {});

            FB.options({ beta: true });

            FB.api('/4', function(result) {
                should.not.exist(result.error && result.error.Error);
                expectedRequest.done(); // verify beta request was made

                done();
            });
        });
    });

    describe("userAgent", function() {
        beforeEach(function() {
            nock('https://graph.facebook.com:443')
                .get('/v2.0/4')
                .reply(function() {
                    return {
                        userAgent: this.req.headers['user-agent']
                    };
                });
        });

        it("Should default to thuzi_nodejssdk/"+FB.version, function() {
            FB.options('userAgent').should.equal("thuzi_nodejssdk/"+FB.version);
        });

        it("Should default the userAgent for FB.api requests to thuzi_nodejssdk/"+FB.version, function() {
            FB.api('/4', function(result) {
                should.not.exist(result.error && result.error.Error);
                result.userAgent.should.equal("thuzi_nodejssdk/"+FB.version);
            });
        });

        it("Should be used as the userAgent for FB.api requests", function() {
            FB.options({userAgent: 'faux/0.0.1'});

            FB.api('/4', function(result) {
                should.not.exist(result.error && result.error.Error);
                result.userAgent.should.equal('faux/0.0.1');
            });
        });
    });

    describe("version", function() {
        it("Should default version to v2.0", function() {
            FB.options('version').should.equal('v2.0');
        });

        it("Should change the version used in FB.api requests", function(done) {
            FB.options({version: 'v2.4'});

            var expectedRequest = nock('https://graph.facebook.com:443')
                .get('/v2.4/4')
                .reply(200, {
                    id: "4",
                    name: "Mark Zuckerberg",
                    first_name: "Mark",
                    last_name: "Zuckerberg",
                    link: "http://www.facebook.com/zuck",
                    gender: "male",
                    locale: "en_US"
                });

            FB.api('4', function(result) {
                should.not.exist(result.error && result.error.Error);
                expectedRequest.done();
                done();
            });
        });

        it("Should not prepend a version to FB.api('/v2.3/4', cb) style requests", function(done) {
            FB.options({version: 'v2.4'});

            var expectedRequest = nock('https://graph.facebook.com:443')
                .get('/v2.3/4')
                .reply(200, {
                    id: "4",
                    name: "Mark Zuckerberg",
                    first_name: "Mark",
                    last_name: "Zuckerberg",
                    link: "http://www.facebook.com/zuck",
                    gender: "male",
                    locale: "en_US"
                });

            FB.api('/v2.3/4', function(result) {
                should.not.exist(result.error && result.error.Error);
                expectedRequest.done();
                done();
            });
        });

        it("Should change the version used in FB.getLoginUrl", function() {
            FB.options({version: 'v2.4'});
            FB.getLoginUrl({ appId: 'app_id' })
                .should.equal('https://www.facebook.com/v2.4/dialog/oauth?response_type=code&redirect_uri=https%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html&client_id=app_id');
        });
    });

});
