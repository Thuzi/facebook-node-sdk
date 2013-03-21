
var config = { };

config.facebook = {
    appId:          process.env.FACEBOOK_APPID          || '',
    appSecret:      process.env.FACEBOOK_APPSECRET      || '',
    scope:                                                 'user_about_me,publish_actions',
    redirectUri:    process.env.FACEBOOK_REDIRECTURI    || 'http://localhost:3000/login/callback'
};

module.exports = config;
