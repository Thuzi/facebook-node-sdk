
var config = { };

// should end in /
config.rootUrl  = process.env.ROOT_URL                  || 'http://localhost:3000/';

config.facebook = {
    appId:          process.env.FACEBOOK_APPID          || '',
    appSecret:      process.env.FACEBOOK_APPSECRET      || '',
    appNamespace:   process.env.FACEBOOK_APPNAMESPACE   || 'nodescrumptious',
    scope:                                                 'user_about_me,publish_actions',
    redirectUri:    process.env.FACEBOOK_REDIRECTURI    ||  config.rootUrl + 'login/callback'
};

module.exports = config;
