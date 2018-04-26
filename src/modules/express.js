const cors = require('cors')
const bodyParser = require('body-parser')

module.exports = {
	configure(app) {
		
		app.use(bodyParser.json())
		
		var whitelist = ['*']
		var corsOptions = {
			origin: function(origin, callback) {
				if (whitelist.indexOf(origin) !== -1) {
					callback(null, true)
				} else {
					callback(new Error('CORS_ERROR'))
				}
			}
		}
		app.use(cors(corsOptions))


		function captureReponseMiddleware(req, res, next) {
			var oldWrite = res.write,
				oldEnd = res.end;
			var chunks = [];
			res.write = function(chunk) {
				chunks.push(chunk);

				oldWrite.apply(res, arguments);
			};
			res.end = function(chunk) {
				if (chunk)
					chunks.push(chunk);
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