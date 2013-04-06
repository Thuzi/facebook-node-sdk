var nock        = require('nock'),
    should      = require('should'),

    FB;

beforeEach(function () {
    FB = require('../..');
});

afterEach(function () {
   nock.cleanAll();
});

describe('FB.api', function () {
    describe('GET', function () {

        describe("FB.api('4', cb)", function () {

            beforeEach(function () {
                nock('https://graph.facebook.com:443')
                    .get('/4')
                    .reply(200, "{\"id\":\"4\",\"name\":\"Mark Zuckerberg\",\"first_name\":\"Mark\",\"last_name\":\"Zuckerberg\",\"link\":\"http:\\/\\/www.facebook.com\\/zuck\",\"username\":\"zuck\",\"gender\":\"male\",\"locale\":\"en_US\"}", { 'access-control-allow-origin': '*',
                        'content-type': 'text/javascript; charset=UTF-8',
                        'content-length': '172' });
            });

            it('should have id 4', function (done) {
                FB.api('4', function (result) {
                    result.should.have.property('id', '4');
                    done();
                });
            });

            it('should have username as zuck', function (done) {
                FB.api('4', function (result) {
                    result.should.have.property('username', 'zuck');
                    done();
                });
            });

        });

        describe("FB.api('/4', cb)", function () {
            it('should have id 4', function (done) {
                nock('https://graph.facebook.com:443')
                    .get('/4')
                    .reply(200, "{\"id\":\"4\",\"name\":\"Mark Zuckerberg\",\"first_name\":\"Mark\",\"last_name\":\"Zuckerberg\",\"link\":\"http:\\/\\/www.facebook.com\\/zuck\",\"username\":\"zuck\",\"gender\":\"male\",\"locale\":\"en_US\"}", { 'access-control-allow-origin': '*',
                        'content-type': 'text/javascript; charset=UTF-8',
                        'content-length': '172' });

                FB.api('/4', function (result) {
                    result.should.have.property('id', '4');
                    done();
                });
            });
        });

        describe.skip("FB.api(4, cb)", function () {
            // this is the default behavior of client side js sdk
            it('should throw synchronously: Expression is of type number, not object', function (done) {
                // TODO
                FB.api(4, function (result) {
                });
            });
        });

        describe("FB.api('4', { fields: 'id' }), cb)", function () {
            it("should return { id: '4' } object", function (done) {
                nock('https://graph.facebook.com:443')
                    .get('/4?fields=id')
                    .reply(200, "{\"id\":\"4\"}", {
                        'content-type': 'text/javascript; charset=UTF-8',
                        'content-length': '10' });

                FB.api('4', { fields: 'id'}, function (result) {
                    result.should.include({id: '4'});
                    done();
                });
            });
        });

        describe("FB.api('4?fields=name', cb)", function () {
            it("should return { id: '4' } object", function (done) {
                nock('https://graph.facebook.com:443')
                    .get('/4?fields=name')
                    .reply(200, "{\"name\":\"Mark Zuckerberg\",\"id\":\"4\"}", {
                        'content-type': 'text/javascript; charset=UTF-8',
                        'content-length': '10' });

                FB.api('4?fields=name', function (result) {
                    result.should.include({id: '4', name: 'Mark Zuckerberg'});
                    done();
                });
            });
        });

        describe("FB.api('/4?fields=name', cb)", function () {
            it("should return { id: '4', name: 'Mark Zuckerberg' } object", function (done) {
                nock('https://graph.facebook.com:443')
                    .get('/4?fields=name')
                    .reply(200, "{\"name\":\"Mark Zuckerberg\",\"id\":\"4\"}", {
                        'content-type': 'text/javascript; charset=UTF-8',
                        'content-length': '10' });

                FB.api('4?fields=name', function (result) {
                    result.should.include({id: '4', name: 'Mark Zuckerberg'});
                    done();
                });
            });
        });

        describe.skip("FB.api('/4?fields=name', { fields: 'id,first_name' }, cb)", function () {
            it("should return { id: '4', name: 'Mark Zuckerberg' } object", function (done) {
                FB.api('4?fields=name', { fields: 'id,first_name' }, function (result) {
                    result.should.include({id: '4', name: 'Mark Zuckerberg'});
                    done();
                });
            });
        });

    });
});
