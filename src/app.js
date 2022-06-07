'use strict';

const fs = require('fs');
const path = require('path');
var app = null;

async function build(options = {}) {
	if (app) {
		return app;
	}
	app = require('fastify')(options);

	app.register(require('@fastify/static'), {
		root: path.join(path.dirname(__dirname), 'static'),
		prefix: '/static/'
	});

	app.register(require('@fastify/formbody'));

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
	app.register(require('@fastify/secure-session'), {
		key: Buffer.from(sessionKey, 'hex'),
		cookie: {
			path: '/'
		}
	});

	app.register(require('./routes/index'));
	app.register(require('./routes/auth'));
	app.register(require('./routes/post'));
	app.setNotFoundHandler((req, reply) => {
		const error = require('./routes/error');
		let details = 'The resource you requested was not found.';
		return error.http404(req, reply, details);
	});

	return app;
}

module.exports = build;
