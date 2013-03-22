
var config          = require('../config');

var meals = {
    cheeseburger:   "Cheeseburger",
    chinese:        "Chinese",
    french:         "French",
    hotdog:         "Hot Dog",
    indian:         "Indian",
    italian:        "Italian",
    pizza:          "Pizza"
};

exports.show = function (req, res, next) {
    var id              = req.params.id,
        meal;

    if(!meals[id]) {
        return res.send(404);
    }

    meal = {
        id:         id,
        title:      meals[id],
        url:        config.rootUrl + 'meals/' + id,
        imageUrl:   config.rootUrl + 'images/meals/' + id + '-full.png'
    };

    res.render('meal', {
        appId:          config.facebook.appId,
        appNamespace:   config.facebook.appNamespace,
        meal:           meal
    });
};

exports.showWinJs = function (req, res, next) {
    // this method is used for facebook-winjs-sdk sample and not required to actually run this sample
    var id              = req.params.id,
        meal;

    if(!meals[id]) {
        return res.send(404);
    }

    meal = {
        id:         id,
        title:      meals[id],
        url:        config.rootUrl + 'winjs/meals/' + id,
        imageUrl:   config.rootUrl + 'images/meals/' + id + '-full.png'
    };

    res.render('meal', {
        appId:          '438749336206495',
        appNamespace:   'winjsscrumptious',
        meal:           meal
    });
};
