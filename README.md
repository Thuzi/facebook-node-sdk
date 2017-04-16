# NodeJS Library for Facebook [![Build Status](https://travis-ci.org/node-facebook/facebook-node-sdk.svg?branch=master)](https://travis-ci.org/node-facebook/facebook-node-sdk)

With facebook-node-sdk you can now easily write the same code and share between your server (nodejs) and the client ([Facebook Javascript SDK](https://developers.facebook.com/docs/reference/javascript/)).

**Author:** [Thuzi](http://www.thuzi.com)

**Maintainer** [Daniel Friesen](https://github.com/dantman)

**License:** Apache v2

# Installing facebook-node-sdk

```
npm install fb
```

```javascript
// Using require() in ES5
var FB = require('fb');

// Using require() in ES2015
var {FB, FacebookApiException} = require('fb');

// Using ES2015 import through Babel
import FB from 'fb'; // or,
import {FB, FacebookApiException} from 'fb';
```

## Library usage

Libraries can isolate themselves from the options belonging to the default `FB` by creating an instance of the `Facebook` class.

```javascript
// ES5
var FB = require('fb'),
    fb = new FB.Facebook(options);

// ES2015 w/ require()
var {Facebook, FacebookApiException} = require('fb'),
    fb = new Facebook(options);

// ES2015 w/ import through Babel
import {Facebook, FacebookApiException} from 'fb';
var fb = new Facebook(options);
```

## Multi-app usage

Applications that run on behalf of multiple apps with different Facebook appIds and secrets can use `.extend` (on `FB` or any `Facebook` instance) to create a new instance which inherits options not set on it from the instance it is created from (like the API `version` your application is coded against).

```javascript
FB.options({version: 'v2.4'});
var fooApp = FB.extend({appId: 'foo_id', appSecret: 'secret'}),
    barApp = FB.extend({appId: 'bar_id', appSecret: 'secret'});
```

## Graph Api

### Get

```js
FB.api('4', function (res) {
  if(!res || res.error) {
   console.log(!res ? 'error occurred' : res.error);
   return;
  }
  console.log(res.id);
  console.log(res.name);
});
```

__Passing Parameters__

```js
FB.api('4', { fields: ['id', 'name'] }, function (res) {
  if(!res || res.error) {
    console.log(!res ? 'error occurred' : res.error);
    return;
  }
  console.log(res.id);
  console.log(res.name);
});
```

### Post

```js
FB.setAccessToken('access_token');

var body = 'My first post using facebook-node-sdk';
FB.api('me/feed', 'post', { message: body }, function (res) {
  if(!res || res.error) {
    console.log(!res ? 'error occurred' : res.error);
    return;
  }
  console.log('Post Id: ' + res.id);
});
```

#### Upload

```js
FB.setAccessToken('access_token');

FB.api('me/photos', 'post', { source: fs.createReadStream('my-vacation.jpg'), caption: 'My vacation' }, function (res) {
  if(!res || res.error) {
    console.log(!res ? 'error occurred' : res.error);
    return;
  }
  console.log('Post Id: ' + res.post_id);
});

FB.api('me/photos', 'post', { source: { value: photoBuffer, options: { contentType: 'image/jpeg' } }, caption: 'My vacation' }, function (res) {
  if(!res || res.error) {
    console.log(!res ? 'error occurred' : res.error);
    return;
  }
  console.log('Post Id: ' + res.post_id);
});
```

### Delete

```js
FB.setAccessToken('access_token');

var postId = '1234567890';
FB.api(postId, 'delete', function (res) {
  if(!res || res.error) {
    console.log(!res ? 'error occurred' : res.error);
    return;
  }
  console.log('Post was deleted');
});
```

## Batch Requests

```js
FB.setAccessToken('access_token');

var extractEtag;
FB.api('', 'post', {
    batch: [
        { method: 'get', relative_url: '4' },
        { method: 'get', relative_url: 'me/friends?limit=50' },
        { method: 'get', relative_url: '4', headers: { 'If-None-Match': '"7de572574f2a822b65ecd9eb8acef8f476e983e1"' } }, /* etags */
        { method: 'get', relative_url: 'me/friends?limit=1', name: 'one-friend' /* , omit_response_on_success: false */ },
        { method: 'get', relative_url: '{result=one-friend:$.data.0.id}/feed?limit=5'}
    ]
}, function(res) {
    var res0, res1, res2, res3, res4,
        etag1;

    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    res0 = JSON.parse(res[0].body);
    res1 = JSON.parse(res[1].body);
    res2 = res[2].code === 304 ? undefined : JSON.parse(res[2].body);   // special case for not-modified responses
                                                                        // set res2 as undefined if response wasn't modified.
    res3 = res[3] === null ? null : JSON.parse(res[3].body);
    res4 = res3 === null ? JSON.parse(res[4].body) : undefined; // set result as undefined if previous dependency failed

    if(res0.error) {
        console.log(res0.error);
    } else {
        console.log('Hi ' + res0.name);
        etag1 = extractETag(res[0]); // use this etag when making the second request.
        console.log(etag1);
    }

    if(res1.error) {
        console.log(res1.error);
    } else {
        console.log(res1);
    }

    // check if there are any new updates
    if(typeof res2 !== "undefined") {
        // make sure there was no error
        if(res2.error) {
            console.log(error);
        } else {
            console.log('new update available');
            console.log(res2);
        }
    }
    else {
        console.log('no updates');
    }

    // check if dependency executed successfully
    if(res[3] === null) {
        // then check if the result it self doesn't have any errors.
        if(res4.error) {
            console.log(res4.error);
        } else {
            console.log(res4);
        }
    } else {
        console.log(res3.error);
    }
});

extractETag = function(res) {
    var etag, header, headerIndex;
    for(headerIndex in res.headers) {
        header = res.headers[headerIndex];
        if(header.name === 'ETag') {
            etag = header.value;
        }
    }
    return etag;
};
```

### Post

```js
FB.setAccessToken('access_token');

var message = 'Hi from facebook-node-js';
FB.api('', 'post', {
    batch: [
        { method: 'post', relative_url: 'me/feed', body:'message=' + encodeURIComponent(message) }
    ]
}, function (res) {
    var res0;

    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    res0 = JSON.parse(res[0].body);

    if(res0.error) {
        console.log(res0.error);
    } else {
        console.log('Post Id: ' + res0.id);
    }
});
```

## OAuth Requests

*This is a non-standard behavior and does not work in the official client side FB JS SDK.*

facebook-node-sdk is capable of handling oauth requests which return non-json responses. You can use it by calling `api` method.

### Get facebook application access token

```javascript

FB.api('oauth/access_token', {
    client_id: 'app_id',
    client_secret: 'app_secret',
    grant_type: 'client_credentials'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    var accessToken = res.access_token;
});
```

### Exchange code for access token

```javascript

FB.api('oauth/access_token', {
    client_id: 'app_id',
    client_secret: 'app_secret',
    redirect_uri: 'http://yoururl.com/callback',
    code: 'code'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    var accessToken = res.access_token;
    var expires = res.expires ? res.expires : 0;
});
```

You can safely extract the code from the url using the `url` module. Always make sure to handle invalid oauth callback as
well as error.

```javascript
var url = require('url');

var urlToParse = 'http://yoururl.com/callback?code=.....#_=_';
var result = url.parse(urlToParse, true);
if(result.query.error) {
    if(result.query.error_description) {
        console.log(result.query.error_description);
    } else {
        console.log(result.query.error);
    }
    return;
} else if (!result.query.code) {
    console.log('not a oauth callback');
    return;
}

var code = result.query.code;
```

### Extend expiry time of the access token

```javascript

FB.api('oauth/access_token', {
    client_id: 'client_id',
    client_secret: 'client_secret',
    grant_type: 'fb_exchange_token',
    fb_exchange_token: 'existing_access_token'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    var accessToken = res.access_token;
    var expires = res.expires ? res.expires : 0;
});
```

## Access Tokens

### setAccessToken
*This is a non-standard api and does not exist in the official client side FB JS SDK.*

**Warning**: Due to Node's asynchronous nature, you should not use `setAccessToken` when `FB` is used on behalf of for multiple users.

```js
FB.setAccessToken('access_token');
```

If you want to use the api compatible with FB JS SDK, pass `access_token` as parameter.

```js
FB.api('me', { fields: ['id', 'name'], access_token: 'access_token' }, function (res) {
    console.log(res);
});
```

### withAccessToken
*This is a non-standard api and does not exist in the official client side FB JS SDK.*

Using `FB.extend` this returns a new FB object that inherits the same options but has an accessToken specific to it set.

```js
var fb = FB.withAccessToken('access_token');
```

### getAccessToken
*Unlike `setAccessToken` this is a standard api and exists in FB JS SDK.*

```js
FB.setAccessToken('access_token');
var accessToken = FB.getAccessToken();
```

### AppSecret Proof
For improved security, as soon as you provide an app secret and an access token, the
library automatically computes and adds the appsecret_proof parameter to your requests.

## Configuration options

### options

*This is a non-standard api and does not exist in the official client side FB JS SDK.*

When this method is called with no parameters it will return all of the current options.

```js
var options = FB.options();
```

When this method is called with a string it will return the value of the option if exists, null if it does not.

```js
var timeout = FB.options('timeout');
```

When this method is called with an object it will merge the object onto the previous options object.
```js
FB.options({accessToken: 'abc'}); //equivalent to calling setAccessToken('abc')
FB.options({timeout: 1000, accessToken: 'XYZ'}); //will set timeout and accessToken options
var timeout = FB.options('timeout'); //will get a timeout of 1000
var accessToken = FB.options('accessToken'); //will get the accessToken of 'XYZ'
```

The existing options are:
* `'accessToken'` string representing the Facebook accessToken to be used for requests. This is the same option that is updated by the `setAccessToken` and `getAccessToken` methods.
* `'appId'` The ID of your app, found in your app's dashboard.
* `'appSecret'` string representing the Facebook application secret.
* `'version'` [default=`'v2.0'`] string representing the Facebook api version to use. Defaults to the oldest available version of the api.
* `'proxy'` string representing an HTTP proxy to be used. Support proxy Auth with Basic Auth, embedding the auth info in the uri: 'http://[username:password@]proxy[:port]' (parameters in brackets are optional).
* `'timeout'` integer number of milliseconds to wait for a response. Requests that have not received a response in *X* ms. If set to null or 0 no timeout will exist. On timeout an error object will be returned to the api callback with the error code of `'ETIMEDOUT'` (example below).
* `'scope'` string representing the Facebook scope to use in `getLoginUrl`.
* `'redirectUri'` string representing the Facebook redirect_uri to use in `getLoginUrl`.
* `'Promise'` Promise implementation to use when `FB.api` is called without a callback. Defaults to the Promise implementation returned by `require('any-promise')`.

### version

*This is a non-standard api and does not exist in the official client side FB JS SDK.*

Gets the string representation of the facebook-node-sdk library version.

```js
var version = FB.version;
```

## Parsing Signed Request

### parseSignedRequest

*This is a non-standard api and does not exist in the official client side FB JS SDK.*

```js
var signedRequestValue = 'signed_request_value';
var appSecret = 'app_secret';

var signedRequest  = FB.parseSignedRequest(signedRequestValue, appSecret);
if(signedRequest) {
    var accessToken = signedRequest.oauth_token;
    var userId = signedRequest.user_id;
    var userCountry = signedRequest.user.country;
}
```

*Note: parseSignedRequest will return undefined if validation fails. Always remember to check the result of parseSignedRequest before accessing the result.*

If you already set the appSecret in options, you can ignore the second parameter when calling parseSignedRequest. If you do pass the second parameter it will use the appSecret passed in parameter instead of using appSecret from options.

If appSecret is absent, parseSignedRequest will throw an error.

```js
FB.options({'appSecret': 'app_secret'});

var signedRequestValue = 'signed_request_value';

var signedRequest  = FB.parseSignedRequest(signedRequestValue);
if(signedRequest) {
    var accessToken = signedRequest.oauth_token;
    var userId = signedRequest.user_id;
    var userCountry = signedRequest.user.country;
}
```

## Manual Login Flow

### getLoginUrl
*This is a non-standard api and does not exist in the official client side FB JS SDK.*

This returns the redirect url for a [manual login flow](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow).

```js
FB.getLoginUrl({
    scope: 'email,user_likes',
    redirect_uri: 'http://example.com/'
});
```

These options are accepted and all correspond to url parameters documented in Facebook's manual login flow documentation.

* `'appId'`/`'client_id'` [default=`FB.options('appId')`] The ID of your app, found in your app's dashboard.
* `'redirectUri'`/`'redirect_uri'` [default=`FB.options('redirectUri')`] The URL that you want to redirect the person logging in back to. This URL will capture the response from the Login Dialog.
* `'scope'` [default=`FB.options('scope')`] A comma separated list of Permissions to request from the person using your app.
* `'display'` Can be set to 'popup'.
* `'state'` An arbitrary unique string created by your app to guard against Cross-site Request Forgery.
* `'responseType'`/`'response_type'` [default=`'code'`] Determines whether the response data included when the redirect back to the app occurs is in URL parameters or fragments.


## Error handling

*Note: Facebook is not consistent with their error format, and different systems can fail causing different error formats*

Some examples of various error codes you can check for:
* `'ECONNRESET'` - connection reset by peer
* `'ETIMEDOUT'` - connection timed out
* `'ESOCKETTIMEDOUT'` - socket timed out
* `'JSONPARSE'` - could not parse JSON response, happens when the FB API has availability issues. It sometimes returns HTML

```js
FB.options({timeout: 1, accessToken: 'access_token'});

FB.api('/me', function (res) {
    if(res && res.error) {
        if(res.error.code === 'ETIMEDOUT') {
            console.log('request timeout');
        }
        else {
            console.log('error', res.error);
        }
    }
    else {
        console.log(res);
    }
});
```

## Promise based interface

*This is a non-standard api and does not exist in the official client side FB JS SDK.*

When `FB.api` is called without a callback it will instead return a Promise that will either resolve with the same response as `FB.api` or be rejected with a `FacebookApiException` error.

```js
FB.api('4')
    .then(function(response) {
        console.log(response);
    })
    .catch(function(error) {
        if(error.response.error.code === 'ETIMEDOUT') {
            console.log('request timeout');
        }
        else {
            console.log('error', error.message);
        }
    });

// In an async function
async function example() {
    try {
        var response = await FB.api('4');
        console.log(response);
    }
    catch(error) {
        if(error.response.error.code === 'ETIMEDOUT') {
            console.log('request timeout');
        }
        else {
            console.log('error', error.message);
        }
    }
}
```

The promise implementation used can be controlled using [any-promise](https://www.npmjs.com/package/any-promise)'s register interface or by setting the `Promise` option.

```js
// any-promise
import 'any-promise/register/bluebird';
import FB from 'fb';
let response = await FB.api('4');

// Promise option
import FB from 'fb';
FB.options({
    Promise: require('bluebird')
});
let response = await fb.api('4');

// Promise option in a library
import {Facebook} from 'fb';
var fb = new Facebook({
    Promise: require('bluebird')
});
let response = await fb.api('4');
```

## Node style callback with FB.napi

*This is a non-standard api and does not exist in the official client side FB JS SDK.*

`FB.napi` takes the same input as `FB.api`. Only the callback parameters is different. In the original `FB.api`, the callback expects one parameter which is the response. In `FB.napi` the callback expects two parameters instead of one and follows the node standards. The first parameter is an error which is always of type `FacebookApiException` and the second parameter is the same response as in `FB.api`. Error response can be accessed using `error.response` which is the same response as the response when using `FB.api`.

```js
FB.napi('4', function(error, response) {
    if(error) {
        if(error.response.error.code === 'ETIMEDOUT') {
            console.log('request timeout');
        }
        else {
            console.log('error', error.message);
        }
    } else {
        console.log(response);
    }
});
```

`FB.napi` was added especially to make it easier to work with async control flow libraries.

Here are some examples of using facebook-node-sdk with [Step](https://npmjs.org/package/step).

You will need to install `step`.

```fb
npm install step
```

### FB.api with Step

```js
var FB      = require('fb'),
    Step    = require('step');

Step(
    function getUser() {
        var self = this;
        FB.api('4', function(res) {
            if(!res || res.error) {
                self(new Error('Error occured'));
            } else {
                self(null, res);
            }
        });
    },
    function processResult(err, res) {
        if(err) throw err;
        console.log(res);
    }
);
```

### FB.napi with Step

Simplified version of facebook-node-sdk async callbacks using `FB.napi`.

```js
var FB      = require('fb'),
    Step    = require('step');

Step(
    function getUser() {
        FB.napi('4', this);
    },
    function processResult(err, res) {
        if(err) throw err;
        console.log(res);
    }
);
```
