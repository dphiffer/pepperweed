'use strict';

const User = require('../models/user');

module.exports = (app, opts, done) => {

	app.get('/signup', (req, reply) => {
		let user = app.site.checkUser(req);
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
			if (! app.site.signupEnabled) {
				throw new Error('Sorry, you cannot sign up for a new account.');
			}
			let user = await User.create({
				slug: values.slug,
				name: values.name,
				email: values.email,
				password: values.password
			})
			req.session.set('user', user.id);
			if (! app.site.options.initialize) {
				app.site.setOption('initialize', 1);
				return reply.redirect('/settings');
			}
			return reply.redirect('/');
		} catch (err) {
			return reply.code(400).view('auth/signup.ejs', {
				feedback: err.message,
				values: values
			});
		}
	});

	app.get('/login', (req, reply) => {
		let user = app.site.checkUser(req);
		let redirect = req.query.redirect || '/';
		if (redirect.substr(0, 1) != '/' || redirect.substr(0, 6) == '/login') {
			redirect = '/';
		}
		if (user) {
			return reply.redirect(redirect);
		}
		if (! app.site.options.initialize) {
			return reply.redirect('/signup');
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
			let user = User.load(values.email, 'email');
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

	app.get('/logout', (req, reply) => {
		req.session.delete();
		return reply.redirect('/login');
	});

	app.get('/password', (req, reply) => {
		let user = app.site.checkUser(req);
		if (user) {
			return reply.redirect('/');
		}
		return reply.view('auth/password.ejs', {
			feedback: null,
			values: {}
		});
	});

	app.post('/password', (req, reply) => {
		let user = app.site.checkUser(req);
		if (user) {
			return reply.redirect('/');
		}
		try {
			let resetId = User.resetPassword(app, req.body.email);
			return reply.redirect(`/password/${resetId}`);
		} catch (err) {
			return reply.view('auth/password.ejs', {
				feedback: err.message,
				values: {
					email: req.body.email
				}
			});
		}
	});

	app.get('/password/:id', (req, reply) => {
		let user = app.site.checkUser(req);
		if (user) {
			return reply.redirect('/');
		}
		return reply.view('auth/password_code.ejs', {
			feedback: null,
			id: req.params.id
		});
	});

	app.post('/password/:id', (req, reply) => {
		let user = app.site.checkUser(req);
		if (user) {
			return reply.redirect('/');
		}
		user = User.checkPasswordReset(req.params.id, req.body.code);
		if (user) {
			req.session.set('user', user.id);
			return reply.redirect('/password/reset');
		} else {
			return reply.view('auth/password_code.ejs', {
				feedback: 'Sorry, that code was incorrect.',
				id: req.params.id
			});
		}
	});

	app.get('/password/reset', (req, reply) => {
		let user = app.site.checkUser(req);
		if (! user) {
			return reply.redirect('/password');
		}
		return reply.view('auth/password_reset.ejs', {
			feedback: null
		});
	});

	app.post('/password/reset', async (req, reply) => {
		let user = app.site.checkUser(req);
		if (! user) {
			return reply.redirect('/password');
		}
		await user.setPassword(req.body.password);
		return reply.redirect('/');
	});

	done();

};
