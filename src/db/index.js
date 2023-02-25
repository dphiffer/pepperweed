'use strict';

const Database = require('better-sqlite3');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

var connections = {};

function connect(connectPath) {
	let dbPath = getPath(connectPath);
	if (connections[dbPath]) {
		return connections[dbPath];
	}
	let db = new Database(dbPath);
	migrate(db, dbPath);
	connections[dbPath] = db;
	return db;
}

function getPath(dbPath) {
	dbPath = dbPath || process.env.DATABASE || 'main.db';
	if (dbPath.indexOf('/') < 0 && dbPath.indexOf('\\') < 0) {
		dbPath = path.join('.', 'data', dbPath);
	}
	return path.resolve(dbPath);
}

function migrate(db, dbPath) {
	let dbVersion = db.pragma('user_version', { simple: true });
	let migrationsDir = path.join(path.dirname(dbPath), 'migrations');
	let migrations = glob.sync(path.join(migrationsDir, '*.sql'));
	migrations.sort();
	for (let file of migrations) {
		let versionMatch = path.basename(file).match(/^\d+/);
		if (versionMatch) {
			let migrationVersion = parseInt(versionMatch[0]);
			if (dbVersion < migrationVersion) {
				db.transaction(() => {
					let sql = fs.readFileSync(file, 'utf8');
					db.exec(sql);
				})();
			}
			db.pragma(`user_version = ${migrationVersion}`);
		}
	}
	return db;
}

module.exports = {
	connect: connect,
	path: getPath,
	option: require('./option')(connect),
	post: require('./post')(connect),
	user: require('./user')(connect)
};
