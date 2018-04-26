var sander = require('sander')
let files = sander.readdirSync(__dirname)
files = files.filter(f=>f!=='index.js')
var self = module.exports = {}
files.filter(f=>{
	return f.indexOf('.js')!==-1
}).forEach(f=>{

	self[f.split('.')[0]]=require(__dirname+'/'+f)
})

