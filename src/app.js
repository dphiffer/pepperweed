'use strict';

const fs = require('fs');
const path = require('path');

if (! fs.existsSync(path.dirname(__dirname), 'conf/secrets.js')) {
	console.log('+----------------------------------------------------------+');
	console.log('|                                                          |');
	console.log('|  conf/secrets.js not found.                              |');
	console.log('|  Please run `npm run setup`                              |');
	console.log('|                                                          |');
	console.log('+----------------------------------------------------------+');
	process.exit(1);
}

let secrets = require('../conf/secrets');

function build(options = {}) {
	let app = require('fastify')(options);

	app.register(require('./routes/index'));
	app.register(require('./routes/auth'));

	app.register(require('fastify-static'), {
		root: path.join(path.dirname(__dirname), 'public')
	});

	app.register(require('fastify-formbody'));

	app.register(require('point-of-view'), {
		engine: {
			ejs: require('ejs')
		},
		root: path.join(__dirname, 'views'),
		layout: 'layout.ejs'
	});

	app.register(require('fastify-secure-session'), {
		key: Buffer.from(secrets.session_key, 'hex'),
		cookie: {
			path: '/'
		}
	});

	return app;
}

module.exports = build;
