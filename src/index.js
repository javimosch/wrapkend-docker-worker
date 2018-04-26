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
	socket.on('start', params => {
		modules.workerManager.start(Object.assign({},startOptions,params))
	})
	socket.on('stop', params => {
		modules.workerManager.stop()
	})
	socket.on('exec', modules.socketFunctions.exec(socket))
	socket.on('call', modules.socketFunctions.call(socket))
})