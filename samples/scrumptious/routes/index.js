
var FB              = require('../../../fb');

FB.options({
    appId: '243756182406310',
    appSecret: 'ccf26c901d9d99d523cf6121113a7f8f',
    scope: 'user_about_me,publish_actions',
    redirect_uri: 'http://localhost:3000/login/callback'
});

function getFacebookLoginUrl () {
    return 'https://www.facebook.com/dialog/oauth' + 
        '?client_id=' + FB.options('appId') +
        '&redirect_uri=' + encodeURIComponent(FB.options('redirect_uri')) +
        '&scope=' + encodeURIComponent(FB.options('scope'));
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
        client_id: FB.options('appId'),
        client_secret: FB.options('appSecret'),
        redirect_uri: FB.options('redirect_uri'),
        code: code
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

exports.logout = function (req, res, next) {
    req.session = null; // clear session
    res.redirect('/');
};
