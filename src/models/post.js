'use strict';

const Base = require('./base');

class Post extends Base {

	get slug() {
		return this.data.slug;
	}

	get title() {
		return this.data.title;
	}

	get created() {
		return this.data.created;
	}

	get updated() {
		return this.data.updated;
	}

	static async query(args = {}) {
		let db = require('../db');
		let query = await db.post.query(args);
		return query.map(data => new Post(data));
	}

	static async load(id) {
		let db = require('../db');
		let data = await db.post.load(id);
		return new Post(data);
	}

	async save() {
		let db = require('../db');
		if (this.id) {
			await db.post.update(this);
			this.data = await db.post.load(this.id);
		} else {
			let rsp = await db.post.create(this);
			this.id = rsp.lastID;
		}
		return this;
	}

	async remove() {
		if (this.id) {
			let db = require('../db');
			await db.post.remove(this);
		}
	}

}

module.exports = Post;
