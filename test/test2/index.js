global.TEST2_LOG = require('../../').init({
	paths: [
		{
			path: '/Users/vit/Desktop/flyme/logs/@date/@user_id.log'
		}
	]
}, TEST_LOG);

TEST2_LOG.log({ activity_id: 'XXX', user_id: 'YYY' }, { random: Math.random() });