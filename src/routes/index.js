'use strict';

import User from '../models/user.js';
import Post from '../models/post.js';

export default (fastify, opts, done) => {

	fastify.get('/', async (req, reply) => {
		let posts = await Post.query();
		let user = await User.current(req);
		posts.forEach(post => {
			post.context = 'index';
		});
		return reply.view('index.ejs', {
			user: user,
			posts: posts
		});
	});

	done();

};
