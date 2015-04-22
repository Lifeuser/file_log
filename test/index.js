/**
 * node test/index.js
 */

global.TEST_LOG = require('../').init({
	paths: [
		{
			path: '/Users/vit/Desktop/flyme/logs/@date/@activity_id.log',
		},
		{
			path: '/Users/vit/Desktop/flyme/logs/@activity_id/@timestamp.log'
		}
	]
}, null);

exports.test2 = require('./test2');