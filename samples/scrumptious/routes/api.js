
var FB              = require('../../../fb'),

    config          = require('../config');

FB.options({
    appId:          config.facebook.appId,
    appSecret:      config.facebook.appSecret,
    scope:          config.facebook.scope,
    redirect_uri:   config.facebook.redirectUri
});

exports.search = function (req, res) {
    var parameters              = req.query;
    parameters.access_token     = req.session.access_token;
    FB.api('/search', req.query, function (result) {
        if(!result || result.error) {
            return res.send(500, 'error');
        }
        res.send(result);
    });
};

exports.friends = function (req, res) {
    FB.api('me/friends', {
        fields:         'name,picture',
        limit:          250,
        access_token:   req.session.access_token
    }, function (result) {
        if(!result || result.error) {
            return res.send(500, 'error');
        }
        res.send(result);
    });
};

exports.announce = function (req, res) {
    var parameters              = req.body;
    parameters.access_token     = req.session.access_token;
    FB.api('/me/' + config.facebook.appNamespace +':eat', 'post', parameters , function (result) {
        if(!result || result.error) {
            return res.send(500, 'error');
        }
        res.send(result);
    });
};
