'use strict';

const fs = require('fs');
const path = require('path');

async function build(options = {}) {
	let app = require('fastify')(options);

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

	app.site = require('./models/site');
	await app.site.setup();

	let sessionKey = await app.site.getOption('sessionKey');
	app.register(require('fastify-secure-session'), {
		key: Buffer.from(sessionKey, 'hex'),
		cookie: {
			path: '/'
		}
	});

	app.register(require('./routes/index'));
	app.register(require('./routes/auth'));

	return app;
}

module.exports = build;
