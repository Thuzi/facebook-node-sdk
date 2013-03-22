
var FB              = require('../../../fb'),

    config          = require('../config');

FB.options({
    appId:          config.facebook.appId,
    appSecret:      config.facebook.appSecret,
    scope:          config.facebook.scope,
    redirect_uri:   config.facebook.redirectUri
});

function getFacebookLoginUrl () {
    return 'https://www.facebook.com/dialog/oauth' +
        '?client_id='    + FB.options('appId') +
        '&redirect_uri=' + encodeURIComponent(FB.options('redirect_uri')) +
        '&scope='        + encodeURIComponent(FB.options('scope'));
}

exports.index = function(req, res) {
    var accessToken = req.session.access_token;
    if(!accessToken) {
        res.render('index', {
            title: 'Express',
            loginUrl: getFacebookLoginUrl()
        });
    } else {
        res.render('menu');
    }
};

exports.loginCallback = function (req, res, next) {
    var code            = req.query.code,
        accessToken     = '',
        expires         = 0;

    if(req.query.error) {
        // user disallowed the app
        return res.render('login-error');
    } else if(!code) {
        return res.redirect('/');
    }

    // exchange code for access token
    FB.api('oauth/access_token', {
        client_id:      FB.options('appId'),
        client_secret:  FB.options('appSecret'),
        redirect_uri:   FB.options('redirect_uri'),
        code:           code
    }, function (result) {
        if(!result || result.error) {
            console.log(!res ? 'error occurred' : res.error);
            return next(result); // todo: handle error
        }

        accessToken     = result.access_token;
        expires         = result.expires ? result.expires : 0;

        // todo: extend access token
        req.session.access_token = accessToken;
        req.session.expires = expires;
        res.redirect('/');
    });
};

exports.logout = function (req, res) {
    req.session = null; // clear session
    res.redirect('/');
};

exports.search = function (req, res) {
    var parameters = req.query;
    parameters.access_token = req.session.access_token;
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
    var parameters = req.body;
    parameters.access_token = req.session.access_token;
    FB.api('/me/' + config.facebook.appNamespace +':eat', 'post', parameters , function (result) {
        if(!result || result.error) {
            return res.send(500, 'error');
        }
        res.send(result);
    });
};
