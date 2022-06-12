'use strict';

import fs from 'fs';
import path from 'path';
import os from 'os';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';

import optionQueries from './option.js';
import postQueries from './post.js';
import userQueries from './user.js';

let db = null;

const connect = async () => {
	if (db) {
		return db;
	}

	let dbPath = process.env.DATABASE || 'data/main.db';
	let exists = fs.existsSync(dbPath);
	let __filename = fileURLToPath(import.meta.url);
	let __dirname = path.dirname(__filename);

	db = await open({
		filename: dbPath,
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

export default {
	connect: connect,
	option: optionQueries(connect),
	post: postQueries(connect),
	user: userQueries(connect)
};
