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
    describe('batch', function() {

        describe("FB.api('', 'post', { batch: [ { method: 'get', relative_url: '4' }, { method: 'get', relative_url: 'me/friends?limit=50' } ], cb)", function() {
            beforeEach(function() {
                nock('https://graph.facebook.com:443')
                    .post('/v2.0/', 'batch=%5B%7B%22method%22%3A%22get%22%2C%22relative_url%22%3A%224%22%7D%2C%7B%22method%22%3A%22get%22%2C%22relative_url%22%3A%22me%2Ffriends%3Flimit%3D50%22%7D%5D')
                    .reply(200, [
                        {
                            "code": 200,
                            "headers": [
                                {
                                    "name": "Access-Control-Allow-Origin",
                                    "value": "*"
                                },
                                {
                                    "name": "Content-Type",
                                    "value": "text/javascript; charset=UTF-8"
                                },
                                {
                                    "name": "Facebook-API-Version",
                                    "value": "v2.4"
                                }
                            ],
                            "body": JSON.stringify({
                                id: "4",
                                name: "Mark Zuckerberg"
                            })
                        },
                        {
                            "code": 200,
                            "headers": [
                                {
                                    "name": "Access-Control-Allow-Origin",
                                    "value": "*"
                                },
                                {
                                    "name": "Content-Type",
                                    "value": "text/javascript; charset=UTF-8"
                                },
                                {
                                    "name": "Facebook-API-Version",
                                    "value": "v2.4"
                                }
                            ],
                            "body": JSON.stringify({
                               "data": [],
                               "summary": {
                                  "total_count": 0
                              }
                          })
                        }
                    ]);
            });

            it('should return batch results', function(done) {
                FB.api('', 'post', {
                    batch: [
                        { method: 'get', relative_url: '4' },
                        { method: 'get', relative_url: 'me/friends?limit=50' }
                    ]
                }, function (result) {
                    should.not.exist(result.error && result.error.Error);
                    result.should.be.a('array');
                    result[0].should.have.property('code', 200);
                    result[1].should.have.property('code', 200);
                    done();
                });
            });
        });

    });
});
