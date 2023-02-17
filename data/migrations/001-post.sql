CREATE TABLE post (
	id INTEGER PRIMARY KEY,
	title TEXT,
	slug TEXT UNIQUE,
	created TEXT,
	updated TEXT
);
