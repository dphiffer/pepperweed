'use strict';

const Queries = require('./queries');

class PostQueries extends Queries {

	async query() {
		let db = await this.connect();
		let query = await db.all(`
			SELECT *
			FROM post
			ORDER BY created DESC
			LIMIT 10
		`);
		query.forEach(data => {
			data.attributes = JSON.parse(data.attributes);
		});
		return query;
	}

	async load(key, value) {
		let validKeys = ['id', 'slug'];
		if (validKeys.indexOf(key) == -1) {
			throw new Queries.InvalidInputError(`Cannot load post by '${key}'`);
		}
		let db = await this.connect();
		let data = await db.get(`
			SELECT *
			FROM post
			WHERE ${key} = ?
		`, value);
		if (! data) {
			throw new Queries.NotFoundError(`Post ${key} '${value}' not found`);
		}
		data.attributes = JSON.parse(data.attributes);
		return data;
	}

	async create(user, slug, attributes) {
		let db = await this.connect();
		let rsp = await db.run(`
			INSERT INTO post
			(user_id, slug, attributes, created, updated)
			VALUES ($user_id, $slug, $attributes, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`, {
			$user_id: user.id,
			$slug: slug,
			$attributes: JSON.stringify(attributes)
		});
		let post = await this.load('id', rsp.lastID);
		return post;
	}

	async update(post) {
		let db = await this.connect();
		let data = await this.load('id', post.id);
		Object.assign(data, post.data);
		let rsp = await db.run(`
			UPDATE post
			SET slug = $slug,
			    title = $title,
			    attributes = $attributes,
			    updated = CURRENT_TIMESTAMP
			WHERE id = $id
		`, {
			$slug: data.slug,
			$title: data.title,
			$attributes: JSON.stringify(post.attributes),
			$id: post.id
		});
		return rsp;
	}

	async remove(post) {
		let db = await this.connect();
		let rsp = await db.run(`
			DELETE FROM post
			WHERE id = ?
		`, post.id);
		return rsp;
	}

}

module.exports = (connect) => {
	return new PostQueries(connect);
};
