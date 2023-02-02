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
		var feedback;
		if (req.body.title) {
			await app.site.setOption('title', req.body.title);
			return reply.redirect('/');
		} else {
			feedback = 'Please enter a site title.';
		}
		return reply.view('settings.ejs', {
			feedback: feedback
		});
	});

	done();

};
