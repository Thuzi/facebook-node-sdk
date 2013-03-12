
var FB              = require('../../../fb');

FB.options({
    appId: ''
    appSecret: ''
    scope: 'user_about_me,publish_stream',
    redirect_uri: 'http://localhost:3000/login/callback'
});

function getFacebookLoginUrl () {
    return 'https://www.facebook.com/dialog/oauth' + 
        '?client_id=' + FB.options('appId') +
        '&redirect_uri=' + encodeURIComponent(FB.options('redirect_uri')) +
        '&scope=' + encodeURIComponent(FB.options('scope'));
}

exports.index = function(req, res) {
    res.render('index', { 
        title: 'Express',
        loginUrl: getFacebookLoginUrl()
    });
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

        accessToken = result.access_token;
        expires = result.expires ? result.expires : 0;

        // todo: extend access token
        req.session.access_token = accessToken;
        req.session.expires = expires;
        res.redirect('/menu');
    });

}

exports.menu = function (req, res, next) {
    req.send('menu');
}
