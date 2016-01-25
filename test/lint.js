'use strict';
var lint = require('mocha-eslint');

if ( !process.env.CI_TEST || process.env.CI_TEST !== 'no-lint' ) {
	lint(['.']);
}
