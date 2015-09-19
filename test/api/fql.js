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
    describe('FQL', function() {
        describe("FB.api('fql', { q: 'SELECT uid FROM user WHERE uid=me()' }, cb)", function() {
            it("should contain a data[0].uid property of '4'", function(done) {
                var expectedRequest = nock('https://graph.facebook.com:443')
                    .get('/fql?q=SELECT%20uid%20FROM%20user%20WHERE%20uid%3Dme()')
                    .reply(200, {
                        "data": [
                            {
                                "uid": "4"
                            }
                        ]
                    });

                FB.api('fql', { q: 'SELECT uid FROM user WHERE uid=me()' }, function (res) {
                    expectedRequest.done();
                    res.should.have.deep.property('data[0].uid', '4');
                    done();
                });
            })
        });

        describe("FB.api('fql', { q: [ 'SELECT uid FROM user WHERE uid=me()', 'SELECT name FROM user WHERE uid=me()' ] }, cb)", function(done) {
            it("should execute a multi-query", function(done) {
                var expectedRequest = nock('https://graph.facebook.com:443')
                    .get('/fql?q=%5B%22SELECT%20uid%20FROM%20user%20WHERE%20uid%3Dme()%22%2C%22SELECT%20name%20FROM%20user%20WHERE%20uid%3Dme()%22%5D')
                    .reply(200, {
                        "data": [
                            {
                                "name": 0,
                                "fql_result_set": [
                                    {
                                        "uid": "4"
                                    }
                                ]
                            },
                            {
                                "name": 1,
                                "fql_result_set": [
                                    {
                                        "name": "Mark Zuckerberg"
                                    }
                                ]
                            }
                        ]
                    });


                FB.api('fql', { q: [
                    'SELECT uid FROM user WHERE uid=me()',
                    'SELECT name FROM user WHERE uid=me()'
                ] }, function(res) {
                    expectedRequest.done();
                    res.should.have.deep.property('data[0].fql_result_set[0].uid', '4');
                    res.should.have.deep.property('data[1].fql_result_set[0].name', 'Mark Zuckerberg');
                    done();
                });
            });
        });
    });
});
