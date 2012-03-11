(function() {
    
    var FB = (function() {
    
        var   request = require('request')
            , api 
            , graph
            , rest
            , oauthRequest
            , accessToken
            , log
            , METHODS = ['get', 'post', 'delete', 'put']
            , readOnlyCalls = {
                  'fql.query': true
                , 'fql.multiquery': true
                , 'friends.get': true
                , 'notifications.get': true
                , 'stream.get': true
                , 'users.getinfo': true
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
            var method = params.method.toLowerCase().replace('.', '_');

            params.format = 'json-strings';
            var domain = readOnlyCalls[method] ? 'api_read' : 'api';
            // oauthRequest(domain, 'resteserver.php', 'get', params, cb);
            throw 'Legacy rest api not supported';
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
                , value;

            if(!params.access_token && accessToken) {
                // todo: have a better way to set the access_token
                params.access_token = accessToken;
            }

            if(domain === 'graph')
                uri = 'https://graph.facebook.com/' + path;
            else
                throw 'Only graph api supported'

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

            request({
                  method: method
                , uri: uri
                , body: body
            }
            ,function(error, response, body) {
                if(error !== null) {
                    console.log(error);
                    return;
                }

                if(cb) cb(JSON.parse(body));
            });
        };

        log = function(d) {
            // todo
            console.log(d);
        };
        
        return {
            'api': api
        };

    })();

    module.exports = FB;

})();
