'use strict';

const User = require('../models/user');
const Post = require('../models/post');

module.exports = (app, opts, done) => {

	app.get('/', (req, reply) => {
		if (! app.site.options.initialize) {
			return reply.redirect('/signup');
		} else if (app.site.options.initialize == 1) {
			return reply.redirect('/settings');
		}
		app.site.checkUser(req);
		let posts = Post.query();
		return reply.view('index.ejs', {
			posts: posts
		});
	});

	done();

};
