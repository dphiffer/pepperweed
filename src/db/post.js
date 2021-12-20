'use strict';

class PostQueries {

	constructor(connect) {
		this.connect = connect;
	}

	async query() {
		let db = await this.connect();
		let Post = await require('../models/post')();
		let rsp = await db.all(`
			SELECT id
			FROM post
			ORDER BY created
			LIMIT 10
		`);
		let posts = [];
		for (let row of rsp) {
			let post = new Post(row.id);
			await post.load();
			posts.push(post);
		}
		return posts;
	}

	async load(id) {
		let db = await this.connect();
		let data = await db.get(`
			SELECT *
			FROM post
			WHERE id = ?
		`, id);
		if (! data) {
			return null;
		}
		return data;
	}

	async save(post) {
		let rsp;
		if (post.id) {
			rsp = await this.update(post);
		} else {
			rsp = await this.create(post);
			post.id = rsp.lastID;
		}
		return rsp;
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
		let rsp = await db.run(`
			UPDATE post
			SET slug = $slug,
			    title = $title,
			    updated = CURRENT_TIMESTAMP
			WHERE id = $id
		`, {
			$slug: post.data.slug,
			$title: post.data.title,
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
