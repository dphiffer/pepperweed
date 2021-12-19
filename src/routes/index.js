'use strict';

module.exports = (fastify, opts, done) => {

	fastify.get('/', async (req, reply) => {
		return reply.view('index.ejs');
	});

	done();

};
