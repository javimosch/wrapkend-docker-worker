const console = require('./console').create(require('path').basename(__filename))
var path = require('path');
const sander = require('sander')
const tempDir = require('temp-dir');
const appName = process.env.APP_NAME || 'wrapkend-worker'
const sequential = require('promise-sequential')
var readdir = require("async-readdir");

module.exports = {
	getWorkingPath,
	getFunctions,
	getCategoryPath
}

function getWorkingPath(){
	console.log('getWorkingPath',process.env.NODE_ENV==='production'?'dist':'src')
	return process.env.NODE_ENV==='production'?'dist':'src'
}

function getFunctions() {
	return new Promise((resolve, reject) => {
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