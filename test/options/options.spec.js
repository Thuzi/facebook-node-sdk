var FB = require('../..'),
    nock = require('nock'),
    should = require('chai').should(),
    omit = require('lodash.omit'),
    defaultOptions = omit(FB.options(), 'appId');

nock.disableNetConnect();

beforeEach(function () {
    FB.options(defaultOptions);
});

afterEach(function () {
    nock.cleanAll();
    FB.options(defaultOptions);
});

describe('FB.options', function () {

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

        it('Should make use graph.facebook when beta is false', function (done) {
            var expectedRequest = nock('https://graph.facebook.com:443').get('/4').reply(200);

            FB.options({ beta: false });

            FB.api('/4', function (result) {
                expectedRequest.done(); // verify non-beta request was made

                done();
            });
        });

        it('Should make use graph.beta.facebook when beta is true', function (done) {
            var expectedRequest = nock('https://graph.beta.facebook.com:443').get('/4').reply(200);

            FB.options({ beta: true });

            FB.api('/4', function (result) {
                expectedRequest.done(); // verify beta request was made

                done();
            });
        });
    });

});
