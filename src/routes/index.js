'use strict';

module.exports = (fastify, opts, done) => {

	fastify.get('/', async (req, reply) => {
		let db = require('../db');
		let posts = await db.post.query();
		return reply.view('index.ejs', {
			posts: posts
		});
	});

	done();

};
