var worker = null

module.exports = {
	start,
	stop,
	checkStatus
}

function stop() {
	if (worker && !worker.killed) {
		worker.kill()
	}
}

async function checkStatus() {
	return {
		exists: !!worker,
		killed: worker && worker.killed
	}
}

function start(options = {}) {
	if (worker && !worker.killed) {
		worker.kill()
	}
	const workingPath = modules.fs.getWorkingPath()
	worker = shelljs.exec(`node ${workingPath}/server.js 2>&1 | node ${workingPath}/scripts/stdin.js`, { // >> somefile.log 
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
}