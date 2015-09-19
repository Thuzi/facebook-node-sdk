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
    describe('POST', function() {

        describe("FB.api('me/feed', 'post', { message: 'My first post using facebook-node-sdk' }, cb)", function() {
            beforeEach(function() {
                nock('https://graph.facebook.com:443')
                    .post('/v2.0/me/feed', 'message=My%20first%20post%20using%20facebook-node-sdk')
                    .reply(200, {
                      "id": "4_14"
                    });
            });

            it('should have id 4_14', function(done) {
                FB.api('me/feed', 'post', { message: 'My first post using facebook-node-sdk' }, function (result) {
                    should.not.exist(result.error && result.error.Error);
                    result.should.have.property('id', '4_14');
                    done();
                });
            });
        });

    });
});
