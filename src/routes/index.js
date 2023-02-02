'use strict';

const User = require('../models/user');
const Post = require('../models/post');

module.exports = (app, opts, done) => {

	app.get('/', async (req, reply) => {
		await app.site.checkUser(req);
		let posts = await Post.query();
		return reply.view('index.ejs', {
			posts: posts
		});
	});

	done();

};
