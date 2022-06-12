'use strict';

import User from '../models/user.js';

export default (fastify, opts, done) => {

	fastify.get('/signup', async (req, reply) => {
		let user = await User.current(req);
		if (user) {
			return reply.redirect('/');
		}
		return reply.view('auth/signup.ejs', {
			user: false,
			response: false,
			values: {}
		});
	});

	fastify.post('/signup', async (req, reply) => {
		let values = Object.assign({
			slug: null,
			name: null,
			email: null,
			password: null
		}, req.body);
		try {
			let user = await User.create({
				slug: values.slug,
				name: values.name,
				email: values.email,
				password: values.password
			})
			req.session.set('user', user.id);
			return reply.redirect('/');
		} catch (err) {
			return reply.code(400).view('auth/signup.ejs', {
				user: false,
				response: err.message,
				values: values
			});
		}
	});

	fastify.get('/login', async (req, reply) => {
		let user = await User.current(req);
		if (user) {
			return reply.redirect('/');
		}
		return reply.view('auth/login.ejs', {
			user: false,
			response: false,
			values: {}
		});
	});

	fastify.post('/login', async (req, reply) => {
		let values = Object.assign({
			email: null,
			password: null
		}, req.body);
		try {
			let user = await User.load(values.email, 'email');
			let valid = await user.checkPassword(values.password);
			if (valid) {
				req.session.set('user', user.id);
				return reply.redirect('/');
			}
		} catch (err) {}
		return reply.code(400).view('auth/login.ejs', {
			user: false,
			response: 'Sorry your login was incorrect.',
			values: values
		});
	});

	fastify.get('/logout', async (req, reply) => {
		req.session.delete();
		return reply.redirect('/login');
	});

	done();

};
