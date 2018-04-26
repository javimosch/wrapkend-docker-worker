const console = require('./console').create(require('path').basename(__filename))
var errToJSON = require('error-to-json')
var modules = require('./')
module.exports = {
	run
}

var requireFromString = require('require-from-string', '', [
	process.cwd()
]);

async function run(name, data) {
	try {
		let code = await modules.fs.getFunction(name)
		if(!code){
			throw new Error('FUNCTION_MISMATCH')
		}
		var codeModule = requireFromString(code);
		let promise = codeModule.default.apply({}, [data])
		return await promise
	} catch (err) {
		err = errToJSON(err);
		err.function = name
		err.payload = data
		throw err
	}
}