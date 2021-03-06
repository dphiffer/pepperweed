'use strict';

let fs = require('fs');
let path = require('path');
let os = require('os');
let sqlite3 = require('sqlite3');
let sqlite = require('sqlite');

let db = null;
let db_path = process.env.DATABASE;
let exists = fs.existsSync(db_path);

const connect = async () => {
	if (db) {
		return db;
	}
	db = await sqlite.open({
		filename: db_path,
		driver: sqlite3.Database
	});
	if (! exists) {
		await db.migrate({
			migrationsPath: path.join(__dirname, 'migrations')
		});
		exists = true;
	}
	return db;
};

module.exports = {
	connect: connect,
	option: require('./option')(connect),
	post: require('./post')(connect),
	user: require('./user')(connect)
};
