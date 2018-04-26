const console = require('../modules/console').create(require('path').basename(__filename))
var test = require('tape');
var fsModule = require('../modules/fs')
var modules = require('../modules')

test('getFunctions', async function (t) {
    t.plan(3);
    let p = fsModule.getFunctions()
    t.equal(p instanceof Promise,true);
    try{
    	let files = await p
    	t.equal(files instanceof Array,true);
    	await modules.installer.writeFunction('fsTest','//empty')
    	t.equal(files.length>0,true,'Function files list should be greater than 0 : '+files.length)
    }catch(err){
    	console.error(err.message)
    	t.end(err)
    }
});