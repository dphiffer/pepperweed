CREATE TABLE user (
	id INTEGER PRIMARY KEY,
	slug TEXT UNIQUE,
	name TEXT,
	email TEXT UNIQUE,
	password TEXT,
	created TEXT,
	updated TEXT
);
