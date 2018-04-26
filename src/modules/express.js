const console = require('../modules/console').create(require('path').basename(__filename))
const cors = require('cors')
const bodyParser = require('body-parser')

module.exports = {
	configure(app) {

		app.use(bodyParser.json())

		var whitelist = process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : ['*']
		console.trace('CORS_WHITELIST', whitelist, typeof whitelist, whitelist instanceof Array)
		var corsOptions = {
			origin: function(origin, callback) {
				if (whitelist.indexOf(origin) !== -1) {
					callback(null, true)
				} else {
					if (whitelist.join(',').indexOf('*') !== -1) {
						return callback(null, true);
					}
					callback(new Error('CORS_ERROR'))
				}
			}
		}
		app.use(cors(corsOptions))


		function captureReponseMiddleware(req, res, next) {
			if (!['POST', 'GET'].includes(req.method.toUpperCase())) {
				return next()
			}

			var oldWrite = res.write,
				oldEnd = res.end;
			var chunks = [];
			res.write = function(chunk) {
				try {
					var c = []
					c.concat(chunks)
					c.push(chunk)
					Buffer.concat(c).toString('utf8')
					chunks.push(chunk);
				} catch (err) {
					console.trace('INVALID_CHUNK', chunk.toString('utf8'))
				}
				oldWrite.apply(res, arguments);
			};
			res.end = function(chunk) {
				if (chunk) {
					try {
						var c = []
						c.concat(chunks)
						c.push(chunk)
						Buffer.concat(c).toString('utf8')
						chunks.push(chunk);
					} catch (err) {
						console.trace('INVALID_CHUNK', chunk.toString('utf8'))
					}
				}

				var body = Buffer.concat(chunks).toString('utf8');
				console.trace('EXPRESS_REQUEST', req.path, req.body);
				console.trace('EXPRESS_RESPONSE', req.path, body);
				oldEnd.apply(res, arguments);
			};
			next();
		}
		app.use(captureReponseMiddleware)
	}
}