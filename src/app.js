'use strict';

import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyFormBody from '@fastify/formbody';
import fastifyView from '@fastify/view';
import fastifySecureSession from '@fastify/secure-session';

import indexRoutes from './routes/index.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/post.js';
import errorRoutes from './routes/error.js';

import site from './models/site.js';

var app = null;

async function build(options = {}) {
	if (app) {
		return app;
	}

	app = Fastify(options);

	app.register(fastifyStatic, {
		root: path.join(path.dirname(options.dir), 'static'),
		prefix: '/static/'
	});
	app.register(fastifyFormBody);
	app.register(fastifyView, {
		engine: {
			ejs: ejs
		},
		root: path.join(options.dir, 'views'),
		layout: 'layout.ejs'
	});

	app.site = site;
	await app.site.setup();

	let sessionKey = await app.site.getOption('sessionKey');
	app.register(fastifySecureSession, {
		key: Buffer.from(sessionKey, 'hex'),
		cookie: {
			path: '/'
		}
	});

	app.register(indexRoutes);
	app.register(authRoutes);
	app.register(postRoutes);
	app.setNotFoundHandler((req, reply) => {
		let details = 'The resource you requested was not found.';
		return errorRoutes.http404(req, reply, details);
	});

	return app;
}

export default build;
