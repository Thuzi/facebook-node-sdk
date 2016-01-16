'use strict';

function FacebookApiException(res) {
	this.name = 'FacebookApiException';
	this.message = JSON.stringify(res || {});
	this.response = res;
	Error.captureStackTrace(this, this.constructor.name);
}

FacebookApiException.prototype = Object.create(Error.prototype, {
	constructor: {
		value: FacebookApiException,
		enumerable: false,
		writable: true,
		configurable: true
	}
});

module.exports = FacebookApiException;
