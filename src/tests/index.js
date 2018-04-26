var sander = require('sander')
let files = sander.readdirSync(__dirname)

files = files.filter(f=>f!=='index.js')

files.forEach(f=>{
	require(__dirname+'/'+f)
})