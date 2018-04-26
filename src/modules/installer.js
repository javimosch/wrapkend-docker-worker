const console = require('./console').create(require('path').basename(__filename))
const babel = require('babel-core')
const path = require('path')
const sander = require('sander')
const tempDir = require('temp-dir');
const appName = process.env.APP_NAME || 'wrapkend-worker'
const sequential = require('promise-sequential')
var modules = require('./')
module.exports = {
	writeFiles,
	writeFunction,
	updateDependencies,
	getPackageJSON
}

async function getPackageJSON() {
	let str = await sander.readFile(path.join(process.cwd(), 'package.json'), {
		encoding: 'utf-8'
	});
	var pkg = JSON.parse(str)
	return pkg
}


async function updateDependencies(deps) {
	var pkg = await getPackageJSON()
	return await sequential(deps.map(d => {
		return async () => {
			var name = d.indexOf('@') != -1 ? d.split('@')[0] : d
			if (Object.keys(pkg.workerDependencies).includes(name)) {
				console.warn('WORKER_DEPENDENCY_SKIP', name)
			} else {
				console.trace('WORKER_DEPENDENCY_ADD', name)
				await modules.shell.exec('yarn add ' + d) //d => moment@1.23
			}
		}
	}))
}

async function writeFunction(name, code) {
	console.trace('writeFunction', getPath('functions', `${normalizeName(name)}.js`))

	code = babel.transform(code, {
		minified: false,
		babelrc: false,
		sourceMaps: 'inline',
		presets: [
			["env", {
				"targets": {
					"node": "6.0"
				}
			}]
		]
	}).code

	await sander.writeFile(getPath('functions', `${normalizeName(name)}.js`), code)
}
async function writeMiddleware(name, code) {
	sander.writeFile(getPath('middlewares', `${normalizeName(name)}.js`), code)
}
async function writeSchedule(name, code) {
	sander.writeFile(getPath('schedules', `${normalizeName(name)}.js`), code)
}

async function writeFiles(files) {
	return await sequential(files.map(def => {
		return async () => {
			if (def.type = 'function') return await writeFunction(def.name, def.code)
			if (def.type = 'middleware') return await writeFunction(def.name, def.code)
			if (def.type = 'schedule') return await writeFunction(def.name, def.code)
			throw new Error(JSON.stringify({
				message: 'WRITE_FILE_TYPE_MISMATCH',
				data: {
					type: def.type,
					name: def.name
				}
			}, null, 2))
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