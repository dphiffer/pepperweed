'use strict';

const build = require('./app');

(async () => {
	try {
		let loggerTransport = process.env.ENVIRONMENT == 'development' ? {
			target: 'pino-pretty',
			options: {
				translateTime: 'SYS:HH:MM:ss',
				ignore: 'pid,hostname,reqId,responseTime,req,res',
				messageFormat: '{msg} {req.method} {req.url}'
			}
		} : undefined;
		const app = build({
			logger: {
				transport: loggerTransport
			},
			ignoreTrailingSlash: true
		});
		app.listen({
			port: process.env.PORT || 3000,
			host: process.env.HOST || '0.0.0.0'
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();
