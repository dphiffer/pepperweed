'use strict';

const error = require('./error');

module.exports = (app, opts, done) => {

	app.get('/settings', async (req, reply) => {
		let user = await app.site.checkUser(req);
		if (! user) {
			return reply.redirect('/login?redirect=/settings');
		}
		return reply.view('settings.ejs', {
			feedback: null
		});
	});

	app.post('/settings', async (req, reply) => {
		let user = await app.site.checkUser(req);
		if (! user) {
			return error.http401(req, reply, `Sorry, you need to login before
				you can modify settings.`);
		}
		var feedback = null;
		if (req.body.title) {
			await app.site.setOption('title', req.body.title);
		} else {
			feedback = 'Please enter a site title.';
		}
		if (req.body.fromEmail) {
			await app.site.setOption('fromEmail', req.body.fromEmail);
		} else {
			feedback = 'Please enter an email address to send from.';
		}
		if (req.body.smtpConfig) {
			await app.site.setOption('smtpConfig', req.body.smtpConfig);
		} else {
			feedback = 'Please enter an SMTP config.';
		}
		if (req.body.signupEnabled) {
			await app.site.setOption('signupEnabled', '1');
		} else {
			await app.site.setOption('signupEnabled', '0');
		}
		if (feedback) {
			return reply.code(400).view('settings.ejs', {
				feedback: feedback
			});
		} else {
			if (app.site.options.initialize < 2) {
				app.site.setOption('initialize', 2);
				return reply.redirect('/edit');
			}
			return reply.redirect('/');
		}
	});

	done();

};
