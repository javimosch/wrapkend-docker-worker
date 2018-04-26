const console = require('../modules/console').create(require('path').basename(__filename))
const path = require('path')
var test = require('tape');
var modules = require('../modules')
const sander = require('sander')



test('Can read package', async function(t) {
    t.plan(1);
    try {
        var pkg = await modules.installer.getPackageJSON()
        t.ok(true, 'Read without problems')
    } catch (err) {
        console.error(err.message)
        t.end(err)
    }
});


test('Can install custom dependencies', async function(t) {
    t.plan(1);
    try {
        await modules.installer.updateDependencies(["moment"])
        t.ok(true, 'Installed without problems')
    } catch (err) {
        console.error(err.message)
        t.end(err)
    }
});