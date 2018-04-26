const path = require('path')
const sander = require('sander')
const tempDir = require('temp-dir');
const appName = process.env.APP_NAME || 'wrapkend-worker'
const sequential = require('promise-sequential')
module.exports = {
	writeFiles,
	writeFunction
}

async function writeFunction(name, code) {
	sander.writeFile(getPath('functions', `${normalizeName(name)}.js`), code)
}
async function writeMiddleware(name, code) {
	sander.writeFile(getPath('middlewares', `${normalizeName(name)}.js`), code)
}
async function writeSchedule(name, code) {
	sander.writeFile(getPath('schedules', `${normalizeName(name)}.js`), code)
}

async function writeFiles(files) {
	return await sequential(files.map(def => {
		return async() => {
			if (def.type = 'function') return await writeFunction(def.name, def.code)
			if (def.type = 'middleware') return await writeFunction(def.name, def.code)
			if (def.type = 'schedule') return await writeFunction(def.name, def.code)
			throw new Error(JSON.stringify({
				message: 'WRITE_FILE_TYPE_MISMATCH',
				data:{
					type: def.type,
					name: def.name
				}
			},null,2))
		}
	}))
}

function getPath(category, fileName) {
	return path.join(tempDir, appName, category, fileName)
}

function normalizeName(target) {
	target = target.replace(new RegExp(' ', 'g'), '_');
	target = target.replace(new RegExp('-', 'g'), '_');
	target = target.toLowerCase()
	if (target.indexOf('.') !== -1) {
		target = target.split('.')[0]
	}
	return target;
}