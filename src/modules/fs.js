const console = require('./console').create(require('path').basename(__filename))
var path = require('path');
const sander = require('sander')
var tempDir = require('temp-dir');
const appName = process.env.APP_NAME || 'wrapkend-worker'
const sequential = require('promise-sequential')
var readdir = require("async-readdir");

if (process.env.WRAPKEND_TEMP_DIR) {
	tempDir = process.env.WRAPKEND_TEMP_DIR
}

module.exports = {
	getWorkingPath,
	getFunctions,
	getCategoryPath,
	getFunction,
	rmFunction
}

function getWorkingPath() {
	console.log('getWorkingPath', process.env.NODE_ENV === 'production' ? 'dist' : 'src')
	return process.env.NODE_ENV === 'production' ? 'dist' : 'src'
}

async function getFunction(name) {
	return await getFile('functions',name)
}
async function getFile(category,name) {
	try {
		return await sander.readFile(getFileNamePath('functions', name + '.js'), {
			encoding: 'utf-8'
		})
	} catch (err) {
		if (err.message.indexOf('ENOENT') !== -1) {
			return ''
		} else {
			throw err
		}
	}
}

async function rmFunction(name) {
	return await sander.rimraf(getFileNamePath('functions', name + '.js'))
}
async function rmFile(category,name) {
	return await sander.rimraf(getFileNamePath(category, name + '.js'))
}

function getFunctions() {
	return new Promise((resolve, reject) => {
		console.log('getFunctions from', getCategoryPath('functions'))
		readdir.read(getCategoryPath('functions'), (error, files) => {
			if (error) {
				if (error.message.indexOf('ENOENT') !== -1) {
					resolve([])
				} else {
					reject(error)
				}
			} else {
				resolve(files)
			}
		});
	})
}

function getFileNamePath(category, fileName) {
	return path.join(tempDir, appName, category, fileName)
}

function getCategoryPath(category, fileName) {
	console.log('getCategoryPath', path.join(tempDir, appName, category))
	return path.join(tempDir, appName, category)
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