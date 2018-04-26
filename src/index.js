require('dotenv').config({
	silent: true
});
import path from 'path'
import shelljs from 'shelljs'
var modules = require('./modules')
var errToJSON = require('error-to-json')
const SOCKET_URL = path.join(process.env.WRAPKEND_SOCKET + '/worker').replace('http:/', 'http://')

var socket = require('socket.io-client')(SOCKET_URL, {
	autoConnect: false
});

var worker = null

socket.on('connect', () => {
	console.log('Connected as', socket.id); // 'G5p5...'

	socket.on('start', params => {
		start()
	})

	socket.on('stop', params => {
		if (worker && !worker.killed) {
			worker.kill()
		}
	})

	socket.on('restart', params => {
		start();
	})



	socket.on('exec', params => {
		var child = shelljs.exec(params.cmd, {
			async: true
		}, function(code, stdout, stderr) {
			socket.emit('execThen_' + params.id, {
				code,
				stderr: stderr.length > 1000 ? stderr.substring(0, 1000) : stderr
			})
		});
	})

	socket.on('call', async params => {
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
				result: await eval(`(async function evaluation(){return await ${params.name}()})()`)
			}
		} catch (err) {
			res = {
				err: errToJSON(err)
			}

		}
		console.log('callResponse_', res)
		socket.emit('callResponse_' + params.id, res)

	})

});

function start() {
	if (worker && !worker.killed) {
		worker.kill()
	}
	const workingPath = modules.fs.getWorkingPath()
	worker = shelljs.exec(`node ${workingPath}/server.js 2>&1 | node ${workingPath}/scripts/stdin.js`, { // >> somefile.log 
		async: true,
		env: process.env,
		cwd: process.cwd()
	}, function(code, stdout, stderr) {
		if (code != 0) {
			socket.emit('logWorkerCrash', {
				stderr: stderr.length > 2000 ? stderr.substring(0, 2000) : stderr
			})
		}
	});
}

async function checkStatus() {
	return {
		exists: !!worker,
		killed: worker && worker.killed
	}
}


setInterval(() => {
	if (!socket.connected) {
		console.log('Waiting socket server at', SOCKET_URL)
		socket.open();
	} else {
		console.log('Waiting orders (', socket.id, ')')
	}
}, 2000)

socket.on('disconnect', function() {
	console.log('disconnect, waiting....')
});

socket.on('reconnect_attempt', () => {
	console.log('Trying to connect...')
});

socket.on('connect_error', () => {
	console.log('connect_error')
});

socket.on('connect_timeout', () => {
	console.log('connect_timeout')
});

socket.on('reconnecting', (attempt) => {
	console.log('reconnecting', attempt)
});

socket.on('reconnect_failed', () => {
	console.log('reconnect_failed')
});

socket.on('reconnect_error', () => {
	console.log('reconnect_error')
});