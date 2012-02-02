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

[TODO]

## Legacy REST Api

__Although Legacy REST Api is supported by facebook-node-sdk, it is highly discouraged to be used, as Facebook is in the process of deprecating the Legacy REST Api.__

### Get

[TODO]

### Post

[TODO]