const console = require('../modules/console').create(require('path').basename(__filename))
var test = require('tape');
var fsModule = require('../modules/fs')
var modules = require('../modules')

test('getFunctions', async function (t) {
    t.plan(3);
    
    try{
        await modules.installer.writeFunction('fsTest','//empty')
        let p = fsModule.getFunctions()
        t.equal(p instanceof Promise,true,'getFunctions returns a Promise');
    	let files = await p
    	t.equal(files instanceof Array,true,'getFunctions response is instanceof Array');
    	t.equal(files.length>0,true,'functions files list should be greater than 0 and is '+files.length)
    }catch(err){
    	console.error(err.message)
    	t.end(err)
    }
});