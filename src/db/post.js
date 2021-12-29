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

	async create(user, slug) {
		let db = await this.connect();
		let rsp = await db.run(`
			INSERT INTO post
			(user_id, slug, created, updated)
			VALUES ($user_id, $slug, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`, {
			$user_id: user.id,
			$slug: slug
		});
		let post = await this.load(rsp.lastID);
		return post;
	}

	async update(post) {
		let db = await this.connect();
		let data = await this.load(post.id);
		Object.assign(data, post.data);
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
			WHERE id = ?
		`, post.id);
		return rsp;
	}

}

module.exports = (connect) => {
	return new PostQueries(connect);
};
