(function() {
    
    var FB = (function() {
    
        var   request = require('request')
            , crypto  = require('crypto')
            , version = require(require('path').resolve(__dirname, 'package.json')).version
            , api 
            , graph
            , rest
            , oauthRequest
            , parseOAuthApiResponse
            , setAccessToken
            , getAccessToken
            , parseSignedRequest
            , base64UrlDecode
            , log
            , has
            , options
            , METHODS = ['get', 'post', 'delete', 'put']
            , opts = {
                  'accessToken': null
                , 'appId': null
                , 'appSecret': null
                , 'timeout': null
                , 'scope':  null
                , 'redirect_uri': null
            }
            , readOnlyCalls = {
                  'admin.getallocation': true
                , 'admin.getappproperties': true
                , 'admin.getbannedusers': true
                , 'admin.getlivestreamvialink': true
                , 'admin.getmetrics': true
                , 'admin.getrestrictioninfo': true
                , 'application.getpublicinfo': true
                , 'auth.getapppublickey': true
                , 'auth.getsession': true
                , 'auth.getsignedpublicsessiondata': true
                , 'comments.get': true
                , 'connect.getunconnectedfriendscount': true
                , 'dashboard.getactivity': true
                , 'dashboard.getcount': true
                , 'dashboard.getglobalnews': true
                , 'dashboard.getnews': true
                , 'dashboard.multigetcount': true
                , 'dashboard.multigetnews': true
                , 'data.getcookies': true
                , 'events.get': true
                , 'events.getmembers': true
                , 'fbml.getcustomtags': true
                , 'feed.getappfriendstories': true
                , 'feed.getregisteredtemplatebundlebyid': true
                , 'feed.getregisteredtemplatebundles': true
                , 'fql.multiquery': true
                , 'fql.query': true
                , 'friends.arefriends': true
                , 'friends.get': true
                , 'friends.getappusers': true
                , 'friends.getlists': true
                , 'friends.getmutualfriends': true
                , 'gifts.get': true
                , 'groups.get': true
                , 'groups.getmembers': true
                , 'intl.gettranslations': true
                , 'links.get': true
                , 'notes.get': true
                , 'notifications.get': true
                , 'pages.getinfo': true
                , 'pages.isadmin': true
                , 'pages.isappadded': true
                , 'pages.isfan': true
                , 'permissions.checkavailableapiaccess': true
                , 'permissions.checkgrantedapiaccess': true
                , 'photos.get': true
                , 'photos.getalbums': true
                , 'photos.gettags': true
                , 'profile.getinfo': true
                , 'profile.getinfooptions': true
                , 'stream.get': true
                , 'stream.getcomments': true
                , 'stream.getfilters': true
                , 'users.getinfo': true
                , 'users.getloggedinuser': true
                , 'users.getstandardinfo': true
                , 'users.hasapppermission': true
                , 'users.isappuser': true
                , 'users.isverified': true
                , 'video.getuploadlimits': true
            };

        /**
         *
         * @access public
         * @param path {String} the url path
         * @param method {String} the http method (default: `"GET"`)
         * @param params {Object} the parameters for the query
         * @param cb {Function} the callback function to handle the response
         */
        api = function() {
            // 
            // FB.api('/platform', function(response) {
            //  console.log(response.company_overview);
            // });
            //
            // FB.api('/platform/posts', { limit: 3 }, function(response) {
            // });
            //
            // FB.api('/me/feed', 'post', { message: body }, function(response) {
            //  if(!response || response.error) {
            //      console.log('Error occured');
            //  } else {
            //      console.log('Post ID:' + response.id);
            //  }
            // });
            //
            // var postId = '1234567890';
            // FB.api(postId, 'delete', function(response) {
            //  if(!response || response.error) {
            //      console.log('Error occurred');
            //  } else {
            //      console.log('Post was deleted');
            //  }
            // });
            //
            //
            if(typeof arguments[0] === 'string') {
                graph.apply(this, arguments);
            } else {
                rest.apply(this, arguments);
            }
        };

        /**
         *
         * Make a api call to Graph server.
         *
         * Except the path, all arguments to this function are optiona. So any of
         * these are valid:
         *
         *  FB.api('/me') // throw away the response
         *  FB.api('/me', function(r) { console.log(r) })
         *  FB.api('/me', { fields: 'email' }); // throw away response
         *  FB.api('/me', { fields: 'email' }, function(r) { console.log(r) });
         *  FB.api('/123456789', 'delete', function(r) { console.log(r) } );
         *  FB.api(
         *      '/me/feed',
         *      'post',
         *      { body: 'hi there' },
         *      function(r) { console.log(r) }
         *  );
         *
         */
        graph = function() {
            var   args = Array.prototype.slice.call(arguments)
                , path = args.shift()
                , next = args.shift()
                , method
                , params
                , cb;

            while(next) {
                var type = typeof next;
                if(type === 'string' && !method) {
                    method = next.toLowerCase();
                } else if(type === 'function' && !cb) {
                    cb = next;
                } else if(type === 'object' && !params) {
                    params = next;
                } else {
                    log('Invalid argument passed to FB.api(): ' + next);
                    return;
                }
                next = args.shift();
            };

            method = method || 'get';
            params = params || {};

            // remove prefix slash if one is given, as it's already in the base url
            if(path[0] === '/') {
                path = path.substr(1);
            }

            if(METHODS.indexOf(method) < 0) {
                log('Invalid method passed to FB.api(): ' + method);
                return;
            }

            oauthRequest('graph', path, method, params, cb);
        };

        /**
         * Old school restserver.php calls.
         *
         * @access private
         * @param params { Object } The required arguments vary based on the method
         * being used, but speficy the method itself is mandatory:
         */
        rest = function(params, cb) {
            var method = params.method.toLowerCase();

            params.format = 'json-strings';
            var domain = readOnlyCalls[method] ? 'api_read' : 'api';
            oauthRequest(domain, 'restserver.php', 'get', params, cb);
        };

        /**
         * Add the oauth parameter, and fire of a request.
         *
         * @access private
         * @param domain {String}   the domain key, one of 'api', 'api_read',
         *                          or 'graph'
         * @param path {String}     the request path
         * @param method {String}   the http method
         * @param params {Object}   the parameters for the query
         * @param cb {Function}     the callback function to handle the response
         */
        oauthRequest = function(domain, path, method, params, cb) {
            var   uri
                , body
                , key
                , value
                , requestOptions
                , isOAuthRequest;

            cb = cb || function() {};
            if(!params.access_token && options('accessToken')) {
                params.access_token = options('accessToken');
            }

            if(domain === 'graph') {
                uri = 'https://graph.facebook.com/' + path;
                isOAuthRequest = /^oauth.*/.test('oauth/');
            }
            else if(domain == 'api') {
                uri = 'https://api.facebook.com/' + path;
            }
            else if(domain == 'api_read') {
                uri = 'https://api-read.facebook.com/' + path;
            }

            if(method === 'post') {
                body = '';
                if(params.access_token) {
                    uri += '?access_token=' + encodeURIComponent(params.access_token);
                    delete params['access_token'];
                }

                for(key in params) {
                    value = params[key];
                    if(typeof value !== 'string') {
                        value = JSON.stringify(value);
                    }
                    if(value !== undefined) {
                        body += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
                    }
                }

                if(body.length > 0) {
                    body = body.substring(0, body.length - 1);
                }
            } else {
                uri += '?';
                for(key in params) {
                    value = params[key];
                    if(typeof value !== 'string') {
                        value = JSON.stringify(value);
                    }
                    uri += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
                }
                uri = uri.substring(0, uri.length -1);
            };

            requestOptions = {
                  method: method
                , uri: uri
                , body: body
            };
            if(options('timeout')) {
                requestOptions['timeout'] = options('timeout');
            }
            request(requestOptions
            , function(error, response, body) {
                if(error !== null) {
                    if(error === Object(error) && has(error, 'error')) {
                        return cb(error);
                    }
                    return cb({error:error});
                }

                if(isOAuthRequest && response && response.statusCode === 200 &&
                    response.headers && /.*text\/plain.*/.test(response.headers['content-type'])) {
                    cb(parseOAuthApiResponse(body));
                } else {
                    try {
                        // sometimes FB is has API errors that return HTML and a message 
                        // of "Sorry, something went wrong". These are infrequent and unpredictable but
                        // let's not let them blow up our application.
                        cb(JSON.parse(body));
                    } catch (ex) {
                        cb({ error: {
                            code: 'JSONPARSE',
                            Error: ex
                        }});
                    }
                }
            });
        };

        parseOAuthApiResponse = function (body) {
            var   result
                , key
                , value
                , split;

            result = {};
            body = body.split('&');
            for(key in body) {
                split = body[key].split('=');
                if(split.length === 2) {
                    value = split[1];
                    if(!isNaN(value)) {
                        result[split[0]] = parseInt(value);
                    } else {
                        result[split[0]] = value;
                    }
                }
            }

            return result;
        };

        log = function(d) {
            // todo
            console.log(d);
        };

        has = function (obj, key) {
            return Object.prototype.hasOwnProperty.call(obj, key);
        };

        getAccessToken = function () {
            return options('accessToken');
        };

        setAccessToken = function (accessToken) {
            options({'accessToken': accessToken});
        };

        /**
         *
         * @access public
         * @param signedRequest {String} the signed request value
         * @param appSecret {String} the application secret
         * @return {Object} the parsed signed request or undefined if failed
         *
         * throws error if appSecret is not defined
         *
         * FB.parseSignedRequest('signedRequest', 'appSecret')
         * FB.parseSignedRequest('signedRequest') // will use appSecret from options('appSecret')
         *
         */
        parseSignedRequest = function () {
            var   args = Array.prototype.slice.call(arguments)
                , signedRequest = args.shift()
                , appSecret = args.shift() || options('appSecret')
                , split
                , encodedSignature
                , encodedEnvelope
                , envelope
                , hmac
                , base64Digest
                , base64UrlDigest;
            
            if(!signedRequest) {
                return;
            }

            if(!appSecret) {
                throw new Error('appSecret required');
            }

            split = signedRequest.split('.');

            if(split.length !== 2) {
                return;
            }

            encodedSignature = split.shift();
            encodedEnvelope = split.shift();

            if(!encodedSignature || !encodedEnvelope) {
                return;
            }

            try {
                envelope = JSON.parse(base64UrlDecode(encodedEnvelope));
            } catch (ex) {
                return;
            }

            if(!(envelope && has(envelope, 'algorithm') && envelope.algorithm.toUpperCase() === 'HMAC-SHA256')) {
                return;
            }

            hmac = crypto.createHmac('sha256', appSecret);
            hmac.update(encodedEnvelope);
            base64Digest = hmac.digest('base64');

            // remove Base64 padding
            base64UrlDigest = base64Digest.replace(/={1,3}$/, '');

            // Replace illegal characters
            base64UrlDigest = base64UrlDigest.replace(/\+/g, '-').replace(/\//g, '_');
            
            if(base64UrlDigest !== encodedSignature) {
                return;
            }

            return envelope;
        };

        base64UrlDecode = function (str) {
            var base64String = str.replace(/\-/g, '+').replace(/_/g, '/');
            var buffer = new Buffer(base64String, 'base64');
            return buffer.toString('utf8');
        }

        options = function (keyOrOptions) {
            var key;
            if(!keyOrOptions) {
                return opts;
            }
            if(Object.prototype.toString.call(keyOrOptions) == '[object String]') {
                return has(opts, keyOrOptions) ? opts[keyOrOptions] : null;
            }
            for(key in opts) {
                if(has(opts, key) && has(keyOrOptions, key)) {
                    opts[key] = keyOrOptions[key];
                }
            }
        };

        return {
              api: api
            , getAccessToken: getAccessToken
            , setAccessToken: setAccessToken // this method does not exist in fb js sdk
            , parseSignedRequest : parseSignedRequest // this method does not exist in fb js sdk
            , options: options // this method does not exist in the fb js sdk
            , version: version // this method does not exist in the fb js sdk
        };

    })();

    module.exports = FB;

})();
