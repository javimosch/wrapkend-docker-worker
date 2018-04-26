//require('path').basename(__filename);
module.exports = {
	create: (file) => {
		var console = require('log-driver')({
			level: process.env.LOGGER_LEVEL || "trace",
			format: function() {
				var args = Array.prototype.slice.call(arguments);
				var level = args[0]
				args.splice(0, 1)
				//args.unshift(fileName)
				return JSON.stringify({
					file,
					level,
					message: args.join(' ')
				}, null, 2);
			}
		});
		console.log = console.trace
		return console;
	}
}