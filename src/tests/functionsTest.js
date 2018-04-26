const console = require('../modules/console').create(require('path').basename(__filename))
var test = require('tape');
var modules = require('../modules')

test('Can fetch function (local)', async function(t) {
    t.plan(2);
    try {
        await modules.installer.writeFunction('fsTest', '//unique-phrase')
        let r = await modules.fs.getFunction('fsTest')
        t.equal(r.indexOf('//unique-phrase') != -1, true, 'Can read function')
        r = await modules.fs.getFunction('fsTestMagicWant')
        t.equal('', '', 'If the function do not exists, returns an empty string')
    } catch (err) {
        console.error(err.message)
        t.end(err)
    }
});
test('Can delete function (local)', async function(t) {
    t.plan(1);
    try {
        await modules.fs.rmFunction('fsTest')
        var r = await modules.fs.getFunction('fsTest')
        t.equal(r, '', 'Function should be deleted')
    } catch (err) {
        console.error(err.message)
        t.end(err)
    }
});

test('Can run function (local)', async function(t) {
    t.plan(3);
    try {
        await modules.installer.writeFunction('helloTest',`
            export default async function(d){ return 'Hello '+d.name}
        `)
        let code = await modules.fs.getFunction('helloTest')
        t.equal(typeof code,'string','getFunction returns string type')
        let result = await modules.functions.run('helloTest',{name:'Marcelo'})
        t.equal(result,'Hello Marcelo','Expected result')
        t.ok(true,'Function finish without problems')
    } catch (err) {
        console.error(err.message)
        t.end(err)
    }
});