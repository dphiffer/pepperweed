'use strict';

const fs = require('fs');
const path = require('path');
var app = null;

function build(options = {}) {
	if (app) {
		return app;
	}
	app = require('fastify')(options);

	app.register(require('@fastify/static'), {
		root: path.join(path.dirname(__dirname), 'static'),
		prefix: '/static/'
	});

	app.register(require('@fastify/formbody'));

	app.site = require('./models/site');
	app.site.setup();

	app.register(require('@fastify/view'), {
		engine: {
			ejs: require('ejs')
		},
		root: path.join(__dirname, 'views'),
		defaultContext: {
			site: app.site
		},
		layout: 'layout.ejs'
	});

	let sessionKey = app.site.getOption('sessionKey');
	app.register(require('@fastify/secure-session'), {
		key: Buffer.from(sessionKey, 'hex'),
		cookie: {
			path: '/'
		}
	});

	app.register(require('./routes/index'));
	app.register(require('./routes/auth'));
	app.register(require('./routes/post'));
	app.register(require('./routes/settings'));
	app.setNotFoundHandler(async (req, reply) => {
		app.site.checkUser(req);
		const error = require('./routes/error');
		let details = 'The requested page was not found.';
		return error.http404(req, reply, details);
	});

	return app;
}

module.exports = build;
