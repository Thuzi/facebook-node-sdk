'use strict';
import debug from 'debug';
import request from 'request';
import URL from 'url';
import QS from 'querystring';
import crypto from 'crypto';
import FacebookApiException from './FacebookApiException';

var {version} = require('../package.json'),
	debugReq = debug('fb:req'),
	debugSig = debug('fb:sig'),
	METHODS = ['get', 'post', 'delete', 'put'],
	toString = Object.prototype.toString,
	has = Object.prototype.hasOwnProperty,
	log = function(d) {
		// todo
		console.log(d); // eslint-disable-line no-console
	},
	defaultOptions = Object.assign(Object.create(null), {
		accessToken: null,
		appId: null,
		appSecret: null,
		appSecretProof: null,
		beta: false,
		version: 'v2.1',
		timeout: null,
		scope: null,
		redirectUri: null,
		proxy: null,
		userAgent: `thuzi_nodejssdk/${version}`
	}),
	isValidOption = function(key) {
		return defaultOptions::has(key);
	},
	parseOAuthApiResponse = function(body) {
		var result = QS.parse(body);
		for ( let key in result ) {
			if ( !isNaN(result[key]) ) {
				result[key] = parseInt(result[key]);
			}
		}

		return result;
	},
	stringifyParams = function(params) {
		var data = {};

		for ( let key in params ) {
			let value = params[key];
			if ( value && typeof value !== 'string' ) {
				value = JSON.stringify(value);
			}
			if ( value !== undefined ) {
				data[key] = value;
			}
		}

		return QS.stringify(data);
	},
	postParamData = function(params) {
		var data = {},
			isFormData = false;

		for ( let key in params ) {
			let value = params[key];
			if ( value && typeof value !== 'string' ) {
				let val = typeof value === 'object' && value::has('value') && value::has('options') ? value.value : value;
				if ( Buffer.isBuffer(val) ) {
					isFormData = true;
				} else if ( typeof val.read === 'function' && typeof val.pipe === 'function' && val.readable ) {
					isFormData = true;
				} else {
					value = JSON.stringify(value);
				}
			}
			if ( value !== undefined ) {
				data[key] = value;
			}
		}

		return {[isFormData ? 'formData' : 'form']: data};
	},
	getAppSecretProof = function(accessToken, appSecret) {
		var hmac = crypto.createHmac('sha256', appSecret);
		hmac.update(accessToken);
		return hmac.digest('hex');
	},
	base64UrlDecode = function(str) {
		var base64String = str.replace(/\-/g, '+').replace(/_/g, '/');
		var buffer = new Buffer(base64String, 'base64');
		return buffer.toString('utf8');
	},
	nodeifyCallback = function(originalCallback) {
		// normalizes the callback parameters so that the
		// first parameter is always error and second is response
		return function(res) {
			if ( !res || res.error ) {
				originalCallback(new FacebookApiException(res));
			} else {
				originalCallback(null, res);
			}
		};
	};

const _opts = Symbol('opts');
const graph = Symbol('graph');
const oauthRequest = Symbol('oauthRequest');

class Facebook {
	FacebookApiException = FacebookApiException; // this Error does not exist in the fb js sdk
	version = version; // this property does not exist in the fb js sdk

	constructor(opts, _internalInherit) {
		if ( _internalInherit instanceof Facebook ) {
			this[_opts] = Object.create(_internalInherit[_opts]);
		} else {
			this[_opts] = Object.create(defaultOptions);
		}

		if ( typeof opts === 'object' ) {
			this.options(opts);
		}
	}

	/**
	 *
	 * @access public
	 * @param path {String} the url path
	 * @param method {String} the http method (default: `"GET"`)
	 * @param params {Object} the parameters for the query
	 * @param cb {Function} the callback function to handle the response
	 */
	api() {
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
		this[graph](...arguments);
	}

	/**
	 *
	 * @access public
	 * @param path {String} the url path
	 * @param method {String} the http method (default: `"GET"`)
	 * @param params {Object} the parameters for the query
	 * @param cb {Function} the callback function to handle the error and response
	 */
	// this method does not exist in fb js sdk
	napi(...args) {
		//
		// normalizes to node style callback so can use the sdk with async control flow node libraries
		//  first parameters:          error (always type of FacebookApiException)
		//  second callback parameter: response
		//
		// FB.napi('/platform', function(err, response) {
		//  console.log(response.company_overview);
		// });
		//
		// FB.napi('/platform/posts', { limit: 3 }, function(err, response) {
		// });
		//
		// FB.napi('/me/feed', 'post', { message: body }, function(error, response) {
		//  if(error) {
		//      console.log('Error occured');
		//  } else {
		//      console.log('Post ID:' + response.id);
		//  }
		// });
		//
		// var postId = '1234567890';
		// FB.napi(postId, 'delete', function(error, response) {
		//  if(error) {
		//      console.log('Error occurred');
		//  } else {
		//      console.log('Post was deleted');
		//  }
		// });
		//
		//

		if ( args.length > 0 ) {
			var originalCallback = args.pop();
			args.push(typeof originalCallback == 'function' ? nodeifyCallback(originalCallback) : originalCallback);
		}

		this.api(...args);
	}

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
	[graph](path, next, ...args) {
		var method,
			params,
			cb;

		if ( typeof path !== 'string' ) {
			throw new Error(`Path is of type ${typeof path}, not string`);
		}

		while ( next ) {
			let type = typeof next;
			if ( type === 'string' && !method ) {
				method = next.toLowerCase();
			} else if ( type === 'function' && !cb ) {
				cb = next;
			} else if ( type === 'object' && !params ) {
				params = next;
			} else {
				log('Invalid argument passed to FB.api(): ' + next);
				return;
			}
			next = args.shift();
		}

		method = method || 'get';
		params = params || {};

		// remove prefix slash if one is given, as it's already in the base url
		if ( path[0] === '/' ) {
			path = path.substr(1);
		}

		if ( METHODS.indexOf(method) < 0 ) {
			log('Invalid method passed to FB.api(): ' + method);
			return;
		}

		this[oauthRequest](path, method, params, cb);
	}

	/**
	 * Add the oauth parameter, and fire of a request.
	 *
	 * @access private
	 * @param path {String}     the request path
	 * @param method {String}   the http method
	 * @param params {Object}   the parameters for the query
	 * @param cb {Function}     the callback function to handle the response
	 */
	[oauthRequest](path, method, params, cb) {
		var uri,
			parsedUri,
			parsedQuery,
			formOptions,
			requestOptions,
			isOAuthRequest,
			pool;

		cb = cb || function() {};
		if ( !params.access_token ) {
			if ( this.options('accessToken') ) {
				params.access_token = this.options('accessToken');
				if ( this.options('appSecret') ) {
					params.appsecret_proof = this.options('appSecretProof');
				}
			}
		} else if ( !params.appsecret_proof && this.options('appSecret') ) {
			params.appsecret_proof = getAppSecretProof(params.access_token, this.options('appSecret'));
		}

		if ( !/^v\d+\.\d+\//.test(path) ) {
			path = this.options('version') + '/' + path;
		}
		uri = `https://graph.${this.options('beta') ? 'beta.' : ''}facebook.com/${path}`;
		isOAuthRequest = /^v\d+\.\d+\/oauth.*/.test(path);

		parsedUri = URL.parse(uri);
		delete parsedUri.search;
		parsedQuery = QS.parse(parsedUri.query);

		if ( method === 'post' ) {
			if ( params.access_token ) {
				parsedQuery.access_token = params.access_token;
				delete params.access_token;

				if ( params.appsecret_proof ) {
					parsedQuery.appsecret_proof = params.appsecret_proof;
					delete params.appsecret_proof;
				}
			}

			formOptions = postParamData(params);
		} else {
			for ( let key in params ) {
				parsedQuery[key] = params[key];
			}
		}

		parsedUri.search = stringifyParams(parsedQuery);
		uri = URL.format(parsedUri);

		pool = {maxSockets: this.options('maxSockets') || Number(process.env.MAX_SOCKETS) || 5};
		requestOptions = {
			method,
			uri,
			...formOptions,
			pool
		};
		if ( this.options('proxy') ) {
			requestOptions['proxy'] = this.options('proxy');
		}
		if ( this.options('timeout') ) {
			requestOptions['timeout'] = this.options('timeout');
		}
		if ( this.options('userAgent') ) {
			requestOptions['headers'] = {
				'User-Agent': this.options('userAgent')
			};
		}

		debugReq(method.toUpperCase() + ' ' + uri);
		request(requestOptions,
			(error, response, body) => {
				if ( error !== null ) {
					if ( error === Object(error) && error::has('error') ) {
						return cb(error);
					}
					return cb({error});
				}

				if ( isOAuthRequest && response && response.statusCode === 200 &&
					response.headers && /.*text\/plain.*/.test(response.headers['content-type'])) {
					// Parse the querystring body used before v2.3
					cb(parseOAuthApiResponse(body));
				} else {
					let json;
					try {
						json = JSON.parse(body);
					} catch (ex) {
						// sometimes FB is has API errors that return HTML and a message
						// of "Sorry, something went wrong". These are infrequent and unpredictable but
						// let's not let them blow up our application.
						json = {
							error: {
								code: 'JSONPARSE',
								Error: ex
							}
						};
					}
					cb(json);
				}
			});
	}

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
	parseSignedRequest(signedRequest, ...args) {
		// this method does not exist in fb js sdk
		var appSecret = args.shift() || this.options('appSecret'),
			split,
			encodedSignature,
			encodedEnvelope,
			envelope,
			hmac,
			base64Digest,
			base64UrlDigest;

		if ( !signedRequest ) {
			debugSig('invalid signedRequest');
			return;
		}

		if ( !appSecret ) {
			throw new Error('appSecret required');
		}

		split = signedRequest.split('.');

		if ( split.length !== 2 ) {
			debugSig('invalid signedRequest');
			return;
		}

		[encodedSignature, encodedEnvelope] = split;

		if ( !encodedSignature || !encodedEnvelope ) {
			debugSig('invalid signedRequest');
			return;
		}

		try {
			envelope = JSON.parse(base64UrlDecode(encodedEnvelope));
		} catch (ex) {
			debugSig('encodedEnvelope is not a valid base64 encoded JSON');
			return;
		}

		if ( !(envelope && envelope::has('algorithm') && envelope.algorithm.toUpperCase() === 'HMAC-SHA256') ) {
			debugSig(envelope.algorithm + ' is not a supported algorithm, must be one of [HMAC-SHA256]');
			return;
		}

		hmac = crypto.createHmac('sha256', appSecret);
		hmac.update(encodedEnvelope);
		base64Digest = hmac.digest('base64');

		// remove Base64 padding
		base64UrlDigest = base64Digest.replace(/={1,3}$/, '');

		// Replace illegal characters
		base64UrlDigest = base64UrlDigest.replace(/\+/g, '-').replace(/\//g, '_');

		if ( base64UrlDigest !== encodedSignature ) {
			debugSig('invalid signature');
			return;
		}

		return envelope;
	}

	/**
	 *
	 * @access public
	 * @param opt {Object} the parameters for appId and scope
	 */
	getLoginUrl(opt = {}) {
		// this method does not exist in fb js sdk
		var clientId = opt.appId || opt.client_id || this.options('appId'),
			redirectUri = opt.redirectUri || opt.redirect_uri || this.options('redirectUri') || 'https://www.facebook.com/connect/login_success.html',
			scope = opt.scope || this.options('scope'),
			display = opt.display,
			state = opt.state,
			scopeQuery = '',
			displayQuery = '',
			stateQuery = '';

		if ( !clientId ) {
			throw new Error('client_id required');
		}

		if ( scope ) {
			scopeQuery = '&scope=' + encodeURIComponent(scope);
		}

		if ( display ) {
			displayQuery = '&display=' + display;
		}

		if ( state ) {
			stateQuery = '&state=' + state;
		}

		return `https://www.facebook.com/${this.options('version')}/dialog/oauth`
			+ '?response_type=' + (opt.responseType || opt.response_type || 'code')
			+  scopeQuery
			+  displayQuery
			+  stateQuery
			+ '&redirect_uri=' + encodeURIComponent(redirectUri)
			+ '&client_id=' + clientId;
	}

	options(keyOrOptions) {
		// this method does not exist in the fb js sdk
		var o = this[_opts];
		if ( !keyOrOptions ) {
			return o;
		}
		if ( keyOrOptions::toString() === '[object String]' ) {
			return isValidOption(keyOrOptions) && keyOrOptions in o ? o[keyOrOptions] : null;
		}
		for ( let key in o ) {
			if ( isValidOption(key) && key in o && keyOrOptions::has(key) ) {
				o[key] = keyOrOptions[key];
				switch (key) {
				case 'appSecret':
				case 'accessToken':
					o.appSecretProof =
						(o.appSecret && o.accessToken) ?
						getAppSecretProof(o.accessToken, o.appSecret) :
						null;
					break;
				}
			}
		}
	}

	/**
	 * Return a new instance of Facebook with a different set of options
	 * that inherit unset options from the current instance.
	 * @access public
	 * @param {Object} [opts] Options to set
	 */
	extend(opts) {
		return new Facebook(opts, this);
	}

	getAccessToken() {
		return this.options('accessToken');
	}

	setAccessToken(accessToken) {
		// this method does not exist in fb js sdk
		this.options({accessToken});
	}

	withAccessToken(accessToken) {
		return this.extend({accessToken});
	}
}

export var FB = new Facebook();
export default FB;
export {Facebook, FacebookApiException, version};
