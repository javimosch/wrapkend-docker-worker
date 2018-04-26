const console = require('../modules/console').create(require('path').basename(__filename))
require('dotenv').config({
	silent: true
});
import path from 'path'
var modules = require('./')
const URI = process.env.NODE_ENV==='production'?process.env.WRAPKEND_SOCKET_PRODUCTION:process.env.WRAPKEND_SOCKET
const SOCKET_URL = path.join(URI + '/worker').replace('http:/', 'http://')
var socket = require('socket.io-client')(SOCKET_URL, {
	autoConnect: false
});

module.exports = {
	mount
}

function mount(handler) {
	var called = false
	socket.on('connect', () => {
		console.log('Connected as', socket.id); // 'G5p5...'
		if(!called){
			handler(socket)
		}
	});
	setInterval(() => {
		if (!socket.connected) {
			console.log('Waiting socket server at', SOCKET_URL)
			socket.open();
		} else {
			//console.log('Waiting orders (', socket.id, ')')
		}
	}, 2000)
}


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