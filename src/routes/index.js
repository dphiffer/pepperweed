'use strict';

const User = require('../models/user');
const Post = require('../models/post');

module.exports = (fastify, opts, done) => {

	fastify.get('/', async (req, reply) => {
		let posts = await Post.query();
		let user = await User.current(req);
		return reply.view('index.ejs', {
			user: user,
			posts: posts
		});
	});

	done();

};
