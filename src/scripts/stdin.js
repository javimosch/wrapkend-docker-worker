require('dotenv').config({
	silent: true
});
const console = require('../modules/console').create(require('path').basename(__filename))
const path = require('path')
const SOCKET_URL = path.join(process.env.WRAPKEND_SOCKET + '/workerLogger').replace('http:/', 'http://')
const socket = require('socket.io-client')(SOCKET_URL, {
	autoConnect: false
});
const readline = require('readline');
start()

function start(){
	ensureSocketConnection()
	captureWorkerStdin()
}

function ensureSocketConnection() {
	socket.on('connect', () => {})
	setInterval(() => {
		if (!socket.connected) {
			console.trace('STDIN:Waiting socket server at', SOCKET_URL)
			socket.open();
		} else {
			//console.trace('STDIN: Waiting orders (', socket.id, ')')
		}
	}, 2000)
}

function captureWorkerStdin() {
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false
	});

	rl.on('line', function(line) {
		console.trace('workerStdout', line);
		socket.emit('workerStdout', {
			line,
			project: process.env.project
		})
	})
}