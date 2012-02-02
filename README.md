# NodeJS Library for Facebook

With facebook-node-sdk you can now easily write the same code and share between your server (nodejs) and the client ([Facebook Javascript SDK](https://developers.facebook.com/docs/reference/javascript/)).

# Installing facebook-node-sdk

```
npm install fb
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

FB.api('', 'post', { 
    batch : [
        { method: 'get', relative_url: 'me' },
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
        { method: 'get', relative_url: '4', headers: { 'If-None-Match': '"7de572574f2a822b65ecd9eb8acef8f476e983e1"' } } /* etags */
    ],
    access_token: accessToken
}, function(res) {
    var res0, res1, res2, res3, res4, res5;

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

    if(res0.error) {
        console.log(res0.error);
    } else {
        console.log('Hi ' + res0.name);
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

    if(typeof res5 !== "undefined") {
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

});
```

## Legacy REST Api

__Although Legacy REST Api is supported by facebook-node-sdk, it is highly discouraged to be used, as Facebook is in the process of deprecating the Legacy REST Api.__

### Get

[TODO]

### Post

[TODO]