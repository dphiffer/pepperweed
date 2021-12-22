'use strict';

const Queries = require('./queries');

class PostQueries extends Queries {

	async query(args = {}) {
		let db = await this.connect();
		let query = await db.all(`
			SELECT *
			FROM post
			ORDER BY created DESC
			LIMIT 10
		`);
		return query;
	}

	async load(id) {
		let db = await this.connect();
		let data = await db.get(`
			SELECT *
			FROM post
			WHERE id = ?
		`, id);
		if (! data) {
			throw new Queries.NotFoundError(`Post ${id} not found`);
		}
		return data;
	}

	async create(post) {
		let db = await this.connect();
		let rsp = await db.run(`
			INSERT INTO post
			(slug, title, created, updated)
			VALUES ($slug, $title, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`, {
			$slug: post.data.slug,
			$title: post.data.title
		});
		return rsp;
	}

	async update(post) {
		let db = await this.connect();
		let data = await this.load(post.id);
		data = Object.assign(data, post.data);
		let rsp = await db.run(`
			UPDATE post
			SET slug = $slug,
			    title = $title,
			    updated = CURRENT_TIMESTAMP
			WHERE id = $id
		`, {
			$slug: data.slug,
			$title: data.title,
			$id: post.id
		});
		return rsp;
	}

	async remove(post) {
		let db = await this.connect();
		let rsp = await db.run(`
			DELETE FROM post
			WHERE id = $id
		`, {
			$id: post.id
		});
		return rsp;
	}

}

module.exports = (connect) => {
	return new PostQueries(connect);
};
