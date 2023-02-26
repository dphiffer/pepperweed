'use strict';

const Queries = require('./queries');

class PostQueries extends Queries {

	query() {
		let db = this.connect();
		let stmt = db.prepare(`
			SELECT *
			FROM post
			ORDER BY created DESC
			LIMIT 10
		`);
		let query = stmt.all();
		query.forEach(data => {
			data.attributes = JSON.parse(data.attributes);
		});
		return query;
	}

	load(key, value) {
		let validKeys = ['id', 'slug'];
		if (validKeys.indexOf(key) == -1) {
			throw new Queries.InvalidInputError(`Cannot load post by '${key}'`);
		}
		let db = this.connect();
		let stmt = db.prepare(`
			SELECT *
			FROM post
			WHERE ${key} = ?
		`);
		let data = stmt.get(value);
		if (! data) {
			throw new Queries.NotFoundError(`Could not find that post`);
		}
		data.attributes = JSON.parse(data.attributes);
		return data;
	}

	create(user, slug, attributes) {
		let db = this.connect();
		let stmt = db.prepare(`
			INSERT INTO post
			(user_id, slug, attributes, created, updated)
			VALUES ($user_id, $slug, $attributes, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`);
		let info = stmt.run({
			user_id: user.id,
			slug: slug,
			attributes: JSON.stringify(attributes)
		});
		return this.load('id', info.lastInsertRowid);
	}

	update(post) {
		let db = this.connect();
		let data = this.load('id', post.id);
		Object.assign(data, post.data);
		let stmt = db.prepare(`
			UPDATE post
			SET slug = $slug,
			    title = $title,
			    attributes = $attributes,
			    updated = CURRENT_TIMESTAMP
			WHERE id = $id
		`);
		return stmt.run({
			slug: data.slug,
			title: data.title,
			attributes: JSON.stringify(post.attributes),
			id: post.id
		});
	}

	remove(post) {
		let db = this.connect();
		let stmt = db.prepare(`
			DELETE FROM post
			WHERE id = ?
		`);
		return stmt.run(post.id);
	}

}

module.exports = (connect) => {
	return new PostQueries(connect);
};
