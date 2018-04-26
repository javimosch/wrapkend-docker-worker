const console = require('../modules/console').create(require('path').basename(__filename))
var path = require('path');
var scriptName = path.basename(__filename);
const express = require('express')
const modules = require('./modules')
const app = express()
var server = require('http').Server(app);
if (!process.env.PORT) throw new Error('PORT required');
modules.express.configure(app)
modules.expressRoutes.configure(app)
server.listen(process.env.PORT, () => console.info(`Listening on port ${process.env.PORT}`))