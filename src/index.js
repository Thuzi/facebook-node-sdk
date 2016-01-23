'use strict';
/**
 * Simultaneously satisfy require('fb') and Babel based ES2015 `import`
 * by exporting an object using Babel's __esModule which contains the normal
 * exports; and bound versions of the methods on FB.
 */
var mod = require('./fb'),
	{FB} = mod;

for ( let key of Object.getOwnPropertyNames(Object.getPrototypeOf(FB)) ) {
	if ( key === 'constructor' ) continue;
	if ( typeof FB[key] === 'function' ) {
		exports[key] = FB[key].bind(FB);
	} else {
		exports[key] = FB[key];
	}
}

for ( var key in mod ) {
	exports[key] = mod[key];
}

Object.defineProperty(exports, '__esModule', {value: true});
