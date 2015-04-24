var fs = require('fs'),
	exec = require('child_process').exec
	moment = require('moment'),
	_ = require('lodash');

var hostname = null;

exec('hostname -f', function (error, _hostname) {
	hostname = _hostname.replace(/[\n\r]+/g, '');
});


var tasks = [],
	working = false;

var interval = setInterval(function () {

	speedUp();

}, 100);

function speedUp() {

	if (tasks.length && !working) {

		working = true;

		var task = tasks[0];

		if (task) {

			tasks.splice(0, 1);

			saveFileLog(task.message, task.path, function (error) {

				working = false;
				task.message = null;
				task = null;

				speedUp();

			});

		}

	}

}

function FileLog(options, parent) {

	var self = this;

	self.params = ['@date', '@timestamp', '@host'];
	self.paths = options.paths;
	self.parent = parent;

	if (self.parent)
		_.each(self.parent.paths, function (parentPath) {

			var _find = _.find(self.paths, function (path) { return path.path == parentPath.path });

			if (_find) return;

			self.paths.push({
				path: parentPath.path
			});

		});

}

FileLog.prototype.log = function (keys, message) {

	if (typeof message !== 'object' || typeof keys !== 'object')
		return;

	var self = this,
		date = new moment();

	message.place = message.place && typeof message.place === 'object' && 'filename' in message.place
		? message.place.filename.split('/').slice(-2).join('/')
		: message.place;

	_.each(self.paths, function (pathOption) {

		var path = pathOption.path;

		if (message.place) {

			var re = new RegExp('@place', 'g');
			path = path.replace(re, message.place);

		}

		_.each(self.params, function (paramOption) {

			var replacement = '',
				re = new RegExp(paramOption, 'g');

			if (paramOption == '@date')
				replacement = date.format('YYYY-MM-DD');

			if (paramOption == '@timestamp')
				replacement = date.valueOf();

			if (paramOption == '@host')
				replacement = hostname;

			path = path.replace(re, replacement);

		});

		_.each(keys, function (v, k) {

			var replacement = '',
				re = new RegExp('@' + k, 'g');

			path = path.replace(re, v);

		});

		if (path.indexOf('.log') == -1)
			path += '.log';

		tasks.push({ message: message, path: path });

	});

};

function saveFileLog (message, path, callback) {

	console.log(path);

	var dir = null,
		lastIndexOfSlash = path.lastIndexOf('/');

	if (lastIndexOfSlash !== -1)
		dir = path.substring(0, lastIndexOfSlash);

	exec('mkdir -p ' + dir, function (error) {

		if (error)
			console.log(error);

		fs.appendFile(path, '\n' + JSON.stringify(message, null, 4), {encoding: 'utf8'}, function (error) {

			if (error)
				console.log(error);

			callback(null);

		});

	});



}

exports.init = function (options, parent) {

	if (!options)
		options = {};

	return new FileLog(options, parent);

}

// var TR_LOG = exports.init({
// 	paths: [
// 		{
// 			path: '/Users/vit/Desktop/flyme/logs/@date/@activity_id.log',
// 			append: true
// 		},
// 		{
// 			path: '/Users/vit/Desktop/flyme/logs/@activity_id/@timestamp.log'
// 		}
// 	]
// }, null);

// TR_LOG.log({ activity_id: 'XXX', user_id: 'YYY' }, { random: Math.random() });

// TR_LOG.log({ activity_id: 'XXX', user_id: 'YYY' }, { random: Math.random() });

// TR_LOG.log({ activity_id: 'XXX', user_id: 'YYY' }, { random: Math.random() });

