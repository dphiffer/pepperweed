'use strict';

const User = require('../models/user');

module.exports = (app, opts, done) => {

	app.get('/signup', async (req, reply) => {
		let user = await app.site.checkUser(req);
		if (user) {
			return reply.redirect('/');
		}
		return reply.view('auth/signup.ejs', {
			feedback: null,
			values: {}
		});
	});

	app.post('/signup', async (req, reply) => {
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
				feedback: err.message,
				values: values
			});
		}
	});

	app.get('/login', async (req, reply) => {
		let user = await app.site.checkUser(req);
		let redirect = req.query.redirect || '/';
		if (redirect.substr(0, 1) != '/' || redirect.substr(0, 6) == '/login') {
			redirect = '/';
		}
		if (user) {
			return reply.redirect(redirect);
		}
		return reply.view('auth/login.ejs', {
			feedback: null,
			values: {},
			redirect: redirect
		});
	});

	app.post('/login', async (req, reply) => {
		let values = Object.assign({
			email: null,
			password: null
		}, req.body);
		let redirect = req.body.redirect || '/';
		try {
			if (redirect.substr(0, 1) != '/' || redirect.substr(0, 6) == '/login') {
				redirect = '/';
			}
			let user = await User.load(values.email, 'email');
			let valid = await user.checkPassword(values.password);
			if (valid) {
				req.session.set('user', user.id);
				return reply.redirect(redirect);
			}
		} catch (err) {}
		return reply.code(400).view('auth/login.ejs', {
			feedback: 'Sorry, your login was incorrect.',
			values: values,
			redirect: redirect
		});
	});

	app.get('/logout', async (req, reply) => {
		req.session.delete();
		return reply.redirect('/login');
	});

	done();

};
