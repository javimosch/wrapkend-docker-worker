const console = require('../modules/console').create(require('path').basename(__filename))
const modules = require('./')

module.exports = {
	configure(app) {
		app.use('/rpc/*', modules.rpc.handler());

		app.post('/installer/writeFiles', (req, res) => {
			if (!req.body.files instanceof Array) {
				throw modules.error.createError('FILES_EXPECTED', req.body)
			}
			modules.installer.writeFiles(req.body.files).then(() => {
				modules.response.sendSuccess("SUCCESS", res)
			}).catch(err => {
				modules.response.sendServerError(err, res)
			})
		});
	}
}