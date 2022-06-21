'use strict';

(async () => {
	try {
		if (! process.env.DATABASE) {
			process.env.DATABASE = './data/main.db';
		}
		let loggerTransport = process.env.ENVIRONMENT == 'development' ? {
			target: 'pino-pretty',
			options: {
				translateTime: 'SYS:HH:MM:ss',
				ignore: 'pid,hostname,reqId,responseTime,req,res',
				messageFormat: '{msg} {req.method} {req.url}'
			}
		} : undefined;
		const server = await require('./app')({
			logger: {
				transport: loggerTransport
			},
			ignoreTrailingSlash: true
		});
		await server.listen({
			port: process.env.PORT || 3000,
			host: process.env.HOST || '0.0.0.0'
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();
