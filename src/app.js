'use strict';

const fs = require('fs');
const path = require('path');

const fastify = require('fastify')({
	logger: {
		prettyPrint: {
			translateTime: true,
			ignore: 'pid,hostname,reqId,responseTime,req,res',
			messageFormat: '{msg} {req.method} {req.url}'
		}
	},
	ignoreTrailingSlash: true
});

if (! fs.existsSync(path.dirname(__dirname), 'conf/secrets.js')) {
	console.log('+----------------------------------------------------------+');
	console.log('|                                                          |');
	console.log('|  conf/secrets.js not found.                              |');
	console.log('|  Please run `npm run setup`                              |');
	console.log('|                                                          |');
	console.log('+----------------------------------------------------------+');
	process.exit(1);
}
const secrets = require('../conf/secrets');

fastify.register(require('fastify-static'), {
	root: path.join(path.dirname(__dirname), 'public')
});

fastify.register(require('fastify-formbody'));

fastify.register(require('point-of-view'), {
	engine: {
		ejs: require('ejs')
	},
	root: path.join(__dirname, 'views'),
	layout: 'layout.ejs'
});

fastify.register(require('fastify-secure-session'), {
	key: Buffer.from(secrets.session_key, 'hex'),
	cookie: {
		path: '/'
	}
});

module.exports = fastify;
