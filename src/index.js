require('dotenv').config({
	silent: true
});
import path from 'path'
var modules = require('./modules')

var startOptions = {
	onError: stderr => {
		socket.emit('logWorkerCrash', {
			stderr: stderr.length > 2000 ? stderr.substring(0, 2000) : stderr
		})
	}
}

modules.wrapkendSocket.mount(socket => {
	socket.on('start', async params => {
		var result;
		try {
			result = await modules.workerManager.start(Object.assign({}, startOptions, params))

		} catch (err) {
			result = err;
		}
		if (params.id) {
			socket.emit('start_' + params.id, result)
		}
	})
	socket.on('stop', params => {
		modules.workerManager.stop()
	})
	socket.on('exec', modules.socketFunctions.exec(socket))
	socket.on('run', modules.socketFunctions.run(socket))

	autoStart().catch(console.error)

})

async function autoStart() {
	if (process.env.WRAPKEND_PROJECT_KEY && process.env.WRAPKEND_PROJECT_ID) {
		var res = await modules.workerManager.start(Object.assign({}, startOptions, {
			env: {
				project: process.env.WRAPKEND_PROJECT_ID,
				serverKey: process.env.WRAPKEND_PROJECT_KEY
			}
		}))
		console.info('Worker initialized with api key', res)
	}
}