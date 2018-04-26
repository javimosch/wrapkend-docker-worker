const modules = require('./modules')
const console = modules.console.create(require('path').basename(__filename))
var path = require('path');
var scriptName = path.basename(__filename);
const express = require('express')

const app = express()
var server = require('http').Server(app);
if (!process.env.PORT) throw new Error('PORT required');
modules.express.configure(app)
modules.expressRoutes.configure(app)

modules.projectSocket.mount(socket => {
	console.log('Socket mounted to ', process.env.project)
	socket.on('function', async d => {
		var response = {
			err: null,
			result: {}
		}
		try {
			response.result = await modules.functions.run(d.name, d.data)
		} catch (err) {
			console.error(err)
			response.err = err
		}

		if (!d.id) {
			console.error('FUNCTION_ID_MISSING', d.name, d.data, response)
		} else {
			socket.emit(`function_${d.id}`, response)
		}

		if (response.err) {
			console.error('FUNCTION_REJECT', d.name, d.data, response)
		} else {
			console.log('FUNCTION_RESOLVE', d.name, d.data, response)
		}

	})
})

server.listen(process.env.PORT, () => console.info(`Listening on port ${process.env.PORT}`))