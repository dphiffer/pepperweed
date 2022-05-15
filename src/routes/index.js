'use strict';

module.exports = (fastify, opts, done) => {

	fastify.get('/', async (req, reply) => {
		let Post = require('../models/post');
		let posts = await Post.query();

		let User = require('../models/user');
		let user = await User.current(req);

		return reply.view('index.ejs', {
			user: user,
			posts: posts,
			header: true
		});
	});

	done();

};
