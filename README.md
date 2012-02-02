# NodeJS Library for Facebook

With facebook-node-sdk you can now easily write the same code and share between your server (nodejs) and the client ([Facebook Javascript SDK](https://developers.facebook.com/docs/reference/javascript/)).

# Installing facebook-node-sdk

```
npm install fb

var FB = require('fb');
```

## Graph Api

### Get

```js
var FB = require('fb');

FB.api('4', function (res) {
  if(!res || res.error) {
   console.log(res.error);
   return;
  }
  console.log(res.id);
  console.log(res.name);
});
```

__Passing Parameters__

```js
var FB = require('fb');

FB.api('4', { fields: ['id', 'name'] }, function (res) {
  if(!res || res.error) {
    console.log(res.error);
    return;
  }
  console.log(res.id);
  console.log(res.name);
});
```

### Post

```js
var FB = require('fb');
var accessToken = ".....";

var body = 'My first post using facebook-node-sdk';
FB.api('me/feed', 'post', { message: body, access_token: accessToken }, function (res) {
  if(!res || res.error) {
    console.log(res.error);
    return;
  }
  console.log('Post Id: ' + res.id);
});
```

### Delete

```js
var FB = require('fb');
var accessToken = '.....');

var postId = '1234567890';
FB.api(postId, 'delete', { access_token: accessToken }, function (res) {
  if(!res || res.error) {
    console.log(res.error);
    return;
  }
  console.log('Post was deleted');
});
```

## Facebook Query Language (FQL)

### Query

```js
var FB = require('fb');
var accessToken = '.....';

FB.api('fql', { q: 'SELECT uid FROM user WHERE uid=me()', access_token: accessToken }, function (res) {
  if(!res || res.error) {
    console.log(res.error);
    return;
  }
  console.log(res.data);
});
```

### Multi-query

```js
var FB = require('fb');
var accessToken = '.....';

FB.api('fql', { q: [
  'SELECT uid FROM user WHERE uid=me()',
  'SELECT name FROM user WHERE uid=me()'
], access_token: accessToken }, function(res) {
  if(!res || res.error) {
    console.log(res.error);
    return;
  }
  console.log(res.data[0].fql_result_set);
  console.log(res.data[1].fql_result_set);
});
```

### Named Multi-query

```js
var FB = require('fb');
var accessToken = '.....';

FB.api('fql', { q : {
  id: 'SELECT uid FROM user WHERE uid=me()',
  name: 'SELECT name FROM user WHERE uid IN (SELECT uid FROM #id)'
}, access_token: accessToken }, function(res) {
  if(!res || res.error) {
    console.log(res.error);
    return;
  }
  console.log(res.data[0].fql_result_set);
  console.log(res.data[1].fql_result_set);
});
```

## Batch Requests

```js
var FB = require('fb');
var accessToken = '.....';

var extractEtag;
FB.api('', 'post', { 
    batch: [
        { method: 'get', relative_url: '4' },
        { method: 'get', relative_url: 'me/friends?limit=50' },
        { method: 'get', relative_url: 'fql?q=' + encodeURIComponent('SELECT uid FROM user WHERE uid=me()' ) }, /* fql */
        { method: 'get', relative_url: 'fql?q=' + encodeURIComponent(JSON.stringify([
                    'SELECT uid FROM user WHERE uid=me()',
                    'SELECT name FROM user WHERE uid=me()'
                ])) }, /* fql multi-query */
        { method: 'get', relative_url: 'fql?q=' + encodeURIComponent(JSON.stringify({
                    id: 'SELECT uid FROM user WHERE uid=me()',
                    name: 'SELECT name FROM user WHERE uid IN (SELECT uid FROM #id)'
                })) }, /* named fql multi-query */
        { method: 'get', relative_url: '4', headers: { 'If-None-Match': '"7de572574f2a822b65ecd9eb8acef8f476e983e1"' } }, /* etags */
        { method: 'get', relative_url: 'me/friends?limit=1', name: 'one-friend' /* , omit_response_on_success: false */ },
        { method: 'get', relative_url: '{result=one-friend:$.data.0.id}/feed?limit=5'}
    ],
    access_token: accessToken
}, function(res) {
    var res0, res1, res2, res3, res4, res5, res6, res7,
        etag1;

    if(!res || res.error) {
        console.log(res.error);
        return;
    }

    res0 = JSON.parse(res[0].body);
    res1 = JSON.parse(res[1].body);
    res2 = JSON.parse(res[2].body);
    res3 = JSON.parse(res[3].body);
    res4 = JSON.parse(res[4].body);
    res5 = res[5].code === 304 ? undefined : JSON.parse(res[5].body);   // special case for not-modified responses
                                                                        // set res5 as undefined if response wasn't modified.
    res6 = res[6] === null ? null : JSON.parse(res[6].body);
    res7 = res6 === null ? JSON.parse(res[7].body) : undefined; // set result as undefined if previous dependency failed

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

    if(res2.error) {
        console.log(res2.error);
    } else {
        console.log(res2.data);
    }

    if(res3.error) {
        console.log(res3.error);
    } else {
        console.log(res3.data[0].fql_result_set);
        console.log(res3.data[1].fql_result_set);
    }

    if(res4.error) {
        console.log(res4.error);
    } else {
        console.log(res4.data[0].fql_result_set);
        console.log(res4.data[0].fql_result_set);
    }

    // check if there are any new updates
    if(typeof res5 !== "undefined") {
        // make sure there was no error
        if(res5.error) {
            console.log(error);
        } else {
            console.log('new update available');
            console.log(res5);
        }
    }
    else {
        console.log('no updates');
    }

    // check if dependency executed successfully    
    if(res[6] === null) {
        // then check if the result it self doesn't have any errors.
        if(res7.error) {
            console.log(res7.error);
        } else {
            console.log(res7);
        }
    } else {
        console.log(res6.error);
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
var FB = require('fb');
var accessToken = '.....';

var message = 'Hi from facebook-node-js';
FB.api('', 'post', {
    batch: [
        { method: 'post', relative_url: 'me/feed', body:'message=' + encodeURIComponent(message) }
    ],
    access_token: accessToken
}, function (res) {
    var res0;

    if(!res || res.error) {
        console.log(res.error);
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

## Legacy REST Api

__Although Legacy REST Api is supported by facebook-node-sdk, it is highly discouraged to be used, as Facebook is in the process of deprecating the Legacy REST Api.__

### Get

[TODO]

### Post

[TODO]