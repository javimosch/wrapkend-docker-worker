var errToJSON = require('error-to-json')
module.exports = {
	sendSuccess,
	sendBadParam,
	sendBadActionImplementation,
	sendServerError
}

function sendSuccess(data, res) {
	res.status(200).json({
		data: data || null
	});
}

function sendBadParam(msg, res) {
	res.status(400).json({
		data: null,
		err: msg,
	});
}

function sendBadActionImplementation(msg, res) {
	res.status(500).json({
		err: msg,
	});
}

function sendServerError(err, res) {
	if (!err) {
		err = new Error('UNDEFINED_ERROR')
	}
	if (!err.messag && !err.stack) {
		err = new Error(JSON.stringify({
			message: "UNKNOWN_ERROR",
			details: err
		}, null, 2))
	}
	console.error('SERVER ERROR', err.message, err.stack)
	let errObject = errToJSON(err);
	if (process.env.ERRORS_RES_MODE === 'message') {
		errObject = {
			message: errObject.message,
			stack: errObject.stack
		}
	}
	let detail = JSON.stringify(errObject, null, 2);
	res.status(500).json({
		data: null,
		err: detail
	});
}