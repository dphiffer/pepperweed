'use strict';

(async () => {
	try {
		if (! process.env.DATABASE) {
			process.env.DATABASE = './data/main.db';
		}
		const server = await require('./app')({
			logger: {
				prettyPrint: {
					translateTime: true,
					ignore: 'pid,hostname,reqId,responseTime,req,res',
					messageFormat: '{msg} {req.method} {req.url}'
				}
			},
			ignoreTrailingSlash: true
		});
		await server.listen(
			process.env.PORT || 3000,
			process.env.HOST || '0.0.0.0'
		);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
})();
