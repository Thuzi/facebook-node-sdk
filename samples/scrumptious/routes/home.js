
var FB              = require('../../../fb'),
    Step            = require('step'),

    config          = require('../config');

FB.options({
    appId:          config.facebook.appId,
    appSecret:      config.facebook.appSecret,
    scope:          config.facebook.scope,
    redirectUri:    config.facebook.redirectUri
});

exports.index = function(req, res) {
    var accessToken = req.session.access_token;
    if(!accessToken) {
        res.render('index', {
            title: 'Express',
            loginUrl: FB.getLoginUrl()
        });
    } else {
        res.render('menu');
    }
};

exports.loginCallback = function (req, res, next) {
    var code            = req.query.code;

    if(req.query.error) {
        // user might have disallowed the app
        return res.send('login-error ' + req.query.error_description);
    } else if(!code) {
        return res.redirect('/');
    }

    Step(
        function exchangeCodeForAccessToken() {
            FB.napi('oauth/access_token', {
                client_id:      FB.options('appId'),
                client_secret:  FB.options('appSecret'),
                redirect_uri:   FB.options('redirectUri'),
                code:           code
            }, this);
        },
        function extendAccessToken(err, result) {
            if(err) throw(err);
            FB.napi('oauth/access_token', {
                client_id:          FB.options('appId'),
                client_secret:      FB.options('appSecret'),
                grant_type:         'fb_exchange_token',
                fb_exchange_token:  result.access_token
            }, this);
        },
        function (err, result) {
            if(err) return next(err);

            req.session.access_token    = result.access_token;
            req.session.expires         = result.expires || 0;

            res.redirect('/');
        }
    );
};

exports.logout = function (req, res) {
    req.session = null; // clear session
    res.redirect('/');
};
