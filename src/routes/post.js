'use strict';

module.exports = (fastify, opts, done) => {

	fastify.get('/new', async (req, reply) => {
		let User = require('../models/user');
		let Post = require('../models/post');
		let user = await User.current(req);
		let post = await Post.create(user);
		return reply.redirect(post.editUrl);
	});

	done();

};
