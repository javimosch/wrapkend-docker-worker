const console = require('../modules/console').create(require('path').basename(__filename))
var modules = require('./')
import shelljs from 'shelljs'
var errToJSON = require('error-to-json')
module.exports = {
	call,
	exec
}

function exec(socket){
	return params => {
		var child = shelljs.exec(params.cmd, {
			async: true
		}, function(code, stdout, stderr) {
			socket.emit('execThen_' + params.id, {
				code,
				stderr: stderr.length > 1000 ? stderr.substring(0, 1000) : stderr
			})
		});
	}
}

function call(socket) {
	return async (params) => {
		console.log('call', params)
		if (!params.id) {
			socket.emit('logWorkerManagerError', {
				message: 'call function expected params.id'
			})
		}
		var res
		try {

			res = {
				err: null,
				result: await eval(`(async function evaluation(){return await modules.workerManager.${params.name}()})()`)
			}
		} catch (err) {
			res = {
				err: errToJSON(err)
			}

		}
		console.log('callResponse_', res)
		socket.emit('callResponse_' + params.id, res)
	}
}