
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

			if (!payload.n) return sendBadParam('404', res)
			if (!payload.d) return sendBadParam('404', res)

			let actionScope = await getActionScope(req)


			await middlewares.run({
				name: payload.n
			}, {
				middlewares: [{
					name: 'authenticateSilent',
					params: [{
						model: 'tae_user'
					}]
				}]
			}, actionScope, payload.d)



			var actionQueryPayload = {
				name: payload.n
			};

			if (req.user) {

				if (!payload.d.$project) {
					throw new Error('PROJECT_REQUIRED')
				}

				if (req.user.role === 'normal') {
					actionQueryPayload.owner = req.user._id
					actionQueryPayload.project = payload.d.$project
				} else {
					actionQueryPayload.project = payload.d.$project
				}
			} else {
				let project = await WraProject.findOne({
					apiKey
				}).select('_id').exec()
				if (!project) {
					throw new Error('INVALID_API_KEY')
				} else {
					actionQueryPayload.project = project._id
				}
			}

			let action = await WraAction.findOne(actionQueryPayload).exec();


			if (!action) return sendServerError(new Error('ACTION_MISMATCH'), res)

			/*
			if (!action.compiledAt || action.updatedAt > action.compiledAt) {
				await compileActions([action]);
			}
			var def
			try {
				def = requireFromString(action.compiledCode);
			} catch (err) {
				throw new Error(JSON.stringify({
					message: "ACTION_COMPILATION_FAIL",
					detail: errToJSON(err)
				}, null, 2))
			}
			let actionPromise = def.default.apply({}, [payload.d])
			if (!actionPromise.then) return sendBadParam('ACTION_PROMISE_REQUIRED', res)
				*/

			//let result = await actionPromise
			let result = await executeActionWithWorker(action, payload.d)

			sendSuccess(result, res)
		})().catch(err => sendServerError(err, res))
	}
}