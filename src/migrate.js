'use strict';

if (! process.env.DATABASE) {
	process.env.DATABASE = './data/main.db';
}
const path = require('path');

(async () => {
	const connect = require('./db').connect;
	const db = await connect();
	const root = path.dirname(__dirname);
	await db.migrate({
		migrationsPath: path.join(root, 'src', 'db', 'migrations')
	});
	const result = await db.get(`
		SELECT id, name
		FROM migrations
		ORDER BY id DESC
		LIMIT 1
	`);
	let prefix = String(result.id).padStart(3, '0');
	console.log(`Migrated database to ${prefix}-${result.name}.sql`);
})();
