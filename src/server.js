'use strict';

import path from 'path';
import { fileURLToPath } from 'url';
import build from './app.js';

(async () => {
	try {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

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
		let server = await build({
			dir: __dirname,
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
