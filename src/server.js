var path = require('path');
var scriptName = path.basename(__filename);
var console = require('log-driver')({
	level: process.env.LOGGER_LEVEL || "trace",
	format: function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(scriptName)
		return JSON.stringify(args);
	}
});
const express = require('express')
const installerModule = require('./modules/installer')
const errorModule = require('./modules/error')
const responseModule = require('./modules/response')
const rpcModule = require('./modules/rpc')

const app = express()
var server = require('http').Server(app);
if (!process.env.PORT) throw new Error('PORT required');

configureExpress(app)

function configureExpress(app) {
	var bodyParser = require('body-parser')
	app.use(bodyParser.json())
	var cors = require('cors')
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
			console.trace('EXPRESS_REQUEST',req.path, req.body);
			console.trace('EXPRESS_RESPONSE',req.path, body);
			oldEnd.apply(res, arguments);
		};
		next();
	}
	app.use(captureReponseMiddleware)
}

app.use('/rpc/*', rpcModule.handler());

app.post('/installer/writeFiles', (req, res) => {
	if(!req.body.files instanceof Array){
		throw errorModule.createError('FILES_EXPECTED',req.body)
	}
	installerModule.writeFiles(req.body.files).then(()=>{
		responseModule.sendSuccess("SUCCESS",res)
	}).catch(err=>{
		responseModule.sendServerError(err,res)
	})
});

server.listen(process.env.PORT, () => console.info(`Listening on port ${process.env.PORT}`))