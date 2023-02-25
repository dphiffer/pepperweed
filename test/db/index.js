'use strict';

const db = require('../../src/db');
const path = require('path');
const tap = require('tap');
const fs = require('fs');

tap.test('database paths', tap => {
	delete process.env.DATABASE;
	let dataDir = path.resolve(path.join(__dirname, '..', '..', 'data'));

	let dbPath = db.path();
	tap.equal(dbPath, path.join(dataDir, 'main.db'));

	process.env.DATABASE = 'test1.db';
	dbPath = db.path();
	tap.equal(dbPath, path.join(dataDir, 'test1.db'));

	dbPath = db.path('test2.db');
	tap.equal(dbPath, path.join(dataDir, 'test2.db'));

	tap.end();
});

tap.test('database migrations', tap => {
	let testDir = path.join(__dirname, '..', '..', 'data', 'test');
	let migrationsDir = path.join(testDir, 'migrations');
	fs.mkdirSync(testDir);
	fs.mkdirSync(migrationsDir);

	fs.writeFileSync(path.join(migrationsDir, '001-test.sql'), `
		CREATE TABLE option (
			key TEXT UNIQUE,
			value TEXT
		);
		INSERT INTO option (key, value) VALUES ('test1', 'test1-value');
	`, 'utf8');
	fs.writeFileSync(path.join(migrationsDir, 'invalid-migration.sql'), `
		INSERT INTO option (key, value) VALUES ('test2', 'test2-value');
	`, 'utf8');

	let dbPath = path.join(testDir, 'migrations.db');
	let testDb = db.connect(dbPath);
	let stmt = testDb.prepare(`
		SELECT value
		FROM option
		WHERE key = 'test1'
	`);
	let test1 = stmt.get();
	tap.equal(test1.value, 'test1-value');

	stmt = testDb.prepare(`
		SELECT value
		FROM option
		WHERE key = 'test2'
	`);
	let test2 = stmt.get();
	tap.equal(typeof test2, 'undefined');

	fs.unlinkSync(path.join(migrationsDir, '001-test.sql'));
	fs.unlinkSync(path.join(migrationsDir, 'invalid-migration.sql'));
	fs.unlinkSync(dbPath);
	fs.rmdirSync(migrationsDir);
	fs.rmdirSync(testDir);

	tap.end();
});
