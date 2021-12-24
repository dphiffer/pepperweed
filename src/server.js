'use strict';

const fastify = require('./app');

fastify.register(require('./routes/index'));
fastify.register(require('./routes/auth'));
// fastify.register(require('./routes/data'));
// fastify.register(require('./routes/api'));

(async () => {
	try {
		await fastify.listen(
			process.env.PORT || 3000,
			process.env.HOST || '0.0.0.0'
		);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
})();
