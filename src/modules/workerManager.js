import shelljs from 'shelljs'
const kill = require('kill-port')
const modules = require('./')

var worker = null

module.exports = {
	start,
	stop,
	checkStatus
}

async function stop() {
	if (worker && !worker.killed) {
		worker.kill()
	}
	await kill(process.env.PORT)
}

async function checkStatus() {
	return {
		exists: !!worker,
		killed: worker && worker.killed
	}
}

async function start(options = {}) {

	if(!options.env && options.env.project){
		throw new Error('WORKER_ENV_PROJECT_MISSING')
	}

	await stop()
	
	const workingPath = modules.fs.getWorkingPath()

	var cmd = `node ${workingPath}/server.js 2>&1 | node ${workingPath}/scripts/stdin.js`;

	if(process.env.NODE_ENV !=='production'){
		//run babel-node
		cmd = `npx babel-node ${workingPath}/server.js 2>&1 | npx babel-node ${workingPath}/scripts/stdin.js`
	}

	worker = shelljs.exec(cmd, { // >> somefile.log 
		async: true,
		env: Object.assign({},process.env,options.env||{}),
		cwd: process.cwd()
	}, function(code, stdout, stderr) {
		if (code != 0) {
			if (options.onError) {
				options.onError(stderr)
			}

		}
	});
	return {
		done:true
	}
}