module.exports = {
	createError(message,data){
		return new Error(JSON.stringify({
			message,
			data
		},null,2))
	}
}