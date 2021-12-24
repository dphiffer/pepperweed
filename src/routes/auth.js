'use strict';

let User = require('../models/user');

module.exports = (fastify, opts, done) => {

	fastify.get('/signup', async (req, reply) => {
		let User = require('../models/user');
		let user = await User.current(req);
		if (user) {
			return reply.redirect('/');
		}
		return reply.view('signup.ejs', {
			user: false
		});
	});

	fastify.post('/signup', async (req, reply) => {
		let password = await User.hashPassword(req.body.password);
		let user = new User({
			slug: req.body.slug,
			name: req.body.name,
			email: req.body.email,
			password: password
		});
		await user.save();
		req.session.set('user', user.id);
		return reply.redirect('/');
	});

	fastify.get('/login', async (req, reply) => {
		let User = require('../models/user');
		let user = await User.current(req);
		if (user) {
			return reply.redirect('/');
		}
		return reply.view('login.ejs', {
			user: false,
			response: false
		});
	});

	fastify.post('/login', async (req, reply) => {
		let user = await User.load(req.body.email);
		let valid = await user.checkPassword(req.body.password);
		if (valid) {
			req.session.set('user', user.id);
			return reply.redirect('/');
		}
		return reply.view('login.ejs', {
			user: false,
			response: 'Sorry your login was incorrect.'
		});
	});

	fastify.get('/logout', async (req, reply) => {
		req.session.delete();
		return reply.redirect('/login');
	});

	done();

};
