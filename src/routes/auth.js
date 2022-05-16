'use strict';

const User = require('../models/user');

module.exports = (fastify, opts, done) => {

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
		try {
			let user = await User.create({
				slug: req.body.slug,
				name: req.body.name,
				email: req.body.email,
				password: req.body.password
			})
			if (user) {
				req.session.set('user', user.id);
				return reply.redirect('/');
			} else {
				return reply.view('auth/signup.ejs', {
					user: false,
					response: 'Sorry your account could not be created.',
					values: req.body
				});
			}
		} catch (err) {
			return reply.view('auth/signup.ejs', {
				user: false,
				response: err.message,
				values: req.body
			});
		}
	});

	fastify.get('/login', async (req, reply) => {
		let User = require('../models/user');
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
		try {
			let user = await User.load(req.body.email, 'email');
			let valid = await user.checkPassword(req.body.password);
			if (valid) {
				req.session.set('user', user.id);
				return reply.redirect('/');
			}
		} catch (err) {}
		return reply.view('auth/login.ejs', {
			user: false,
			response: 'Sorry your login was incorrect.',
			values: req.body
		});
	});

	fastify.get('/logout', async (req, reply) => {
		req.session.delete();
		return reply.redirect('/login');
	});

	done();

};
