const console = require('../modules/console').create(require('path').basename(__filename))
var modules = require('./')
import shelljs from 'shelljs'
var errToJSON = require('error-to-json')
module.exports = {
	run,
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

function run(socket) {
	return async (options) => {
		console.log('run', options)
		if (!options.id) {
			socket.emit('logWorkerManagerError', {
				message: 'run function expected params.id'
			})
		}
		var res
		try {

			res = {
				err: null,
				result: await eval(`(async function evaluation(){
					var params = ${JSON.stringify(options.params||{},null,2)};
					return await modules.workerManager.${options.name}(params)})()`)
			}
		} catch (err) {
			res = {
				err: errToJSON(err)
			}

		}
		console.log('run_after_' + options.id, res)
		socket.emit('run_after_' + options.id, res)
	}
}