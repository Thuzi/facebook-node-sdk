var nock = require('nock'),
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

describe('FB.api', function() {
    describe('GET', function() {

        describe("FB.api('4', cb)", function() {

            beforeEach(function() {
                nock('https://graph.facebook.com:443')
                    .get('/4')
                    .reply(200, {
                        id: "4",
                        name: "Mark Zuckerberg",
                        first_name: "Mark",
                        last_name: "Zuckerberg",
                        link: "http://www.facebook.com/zuck",
                        username: "zuck",
                        gender: "male",
                        locale: "en_US"
                    });
            });

            it('should have id 4', function(done) {
                FB.api('4', function(result) {
                    result.should.have.property('id', '4');
                    done();
                });
            });

            it('should have username as zuck', function(done) {
                FB.api('4', function(result) {
                    result.should.have.property('username', 'zuck');
                    done();
                });
            });

        });

        describe("FB.api('/4', cb)", function() {
            it('should have id 4', function(done) {
                nock('https://graph.facebook.com:443')
                    .get('/4')
                    .reply(200, {
                        id: "4",
                        name: "Mark Zuckerberg",
                        first_name: "Mark",
                        last_name: "Zuckerberg",
                        link: "http://www.facebook.com/zuck",
                        username: "zuck",
                        gender: "male",
                        locale: "en_US"
                    });

                FB.api('/4', function(result) {
                    result.should.have.property('id', '4');
                    done();
                });
            });
        });

        describe("FB.api(4, cb)", function(done) {
            // this is the default behavior of client side js sdk
            it('should throw synchronously: Expression is of type number, not object', function(done) {
                try {
                    FB.api(4, function(result) {
                    });

                    done(new Error('Passing in a number should throw an exception'));
                }
                catch (e) {
                    done();
                }
            });
        });

        describe("FB.api('4', { fields: 'id' }), cb)", function() {
            it("should return { id: '4' } object", function(done) {
                nock('https://graph.facebook.com:443')
                    .get('/4?fields=id')
                    .reply(200, {
                        id: "4"
                    });

                FB.api('4', { fields: 'id'}, function(result) {
                    result.should.include({id: '4'});
                    done();
                });
            });
        });

        describe("FB.api('/4?fields=name', cb)", function() {
            it("should return { id: '4', name: 'Mark Zuckerberg' } object", function(done) {
                nock('https://graph.facebook.com:443')
                    .get('/4?fields=name')
                    .reply(200, {
                        name: "Mark Zuckerberg",
                        id: "4"
                    });

                FB.api('/4?fields=name', function(result) {
                    result.should.have.keys('id', 'name')
                        .and.include({id: '4', name: 'Mark Zuckerberg'});
                    done();
                });
            });
        });

        describe.skip("FB.api('/4?fields=name', { fields: 'id,first_name' }, cb)", function() {
            it("should return { id: '4', name: 'Mark Zuckerberg' } object", function(done) {
                FB.api('4?fields=name', { fields: 'id,first_name' }, function(result) {
                    result.should.include({id: '4', name: 'Mark Zuckerberg'});
                    done();
                });
            });
        });

    });

    describe('oauth', function() {
        describe("FB.api('oauth/access_token', { ..., grant_type: 'client_credentials' }, cb)", function() {
            it("should return an { access_token: '...' } object", function(done) {
                nock('https://graph.facebook.com:443')
                    .get('/oauth/access_token')
                    .query({
                        client_id: 'app_id',
                        client_secret: 'app_secret',
                        grant_type: 'client_credentials'
                    })
                    .reply(200, {
                        access_token: '...'
                    });

                FB.api('oauth/access_token', {
                    client_id: 'app_id',
                    client_secret: 'app_secret',
                    grant_type: 'client_credentials'
                }, function(result) {
                    result.should.have.keys('access_token')
                        .and.include({ access_token: '...' });
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
                    .get('/4')
                    .reply(200, {
                        id: "4",
                        name: "Mark Zuckerberg",
                        first_name: "Mark",
                        last_name: "Zuckerberg",
                        link: "http://www.facebook.com/zuck",
                        username: "zuck",
                        gender: "male",
                        locale: "en_US"
                    });

                FB.napi('/4', function(err, result) {
                    should.not.exist(err);
                    result.should.have.property('id', '4');
                    done();
                });
            });
        });

    });
});
