var modules = require('./');
module.exports = {
	handler
}

function handler() {
	return function(req, res) {
		(async () => {
			let payload = req.body;
			let apiKey = req.params.client;

			const WraAction = db.conn().model('wra_action')
			const WraProject = db.conn().model('wra_project')

			if (!payload.n) return modules.response.sendBadParam('404', res)
			if (!payload.d) return modules.response.sendBadParam('404', res)

			let actionScope = await getActionScope(req)

			//let result = await executeActionWithWorker(action, payload.d)

			modules.error.sendSuccess(result, res)
		})().catch(err => modules.error.sendServerError(err, res))
	}
}

function getActionScope(req){
	return {}
}