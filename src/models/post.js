'use strict';

const crypto = require('crypto');
const Base = require('./base');
const User = require('./user');

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

	get url() {
		return `/${this.user.slug}/${this.slug}`;
	}

	get editUrl() {
		return `/edit/${this.slug}`;
	}

	static async query(args = {}) {
		let db = require('../db');
		let query = await db.post.query(args);
		return query.map(data => new Post(data));
	}

	static async create(user) {
		let db = require('../db');
		let slug = crypto.randomBytes(20).toString('hex');
		let data = await db.post.create(user, slug);
		let post = await Post.init(data);
		return post;
	}

	static async load(id) {
		let db = require('../db');
		let data = await db.post.load(id);
		let post = await Post.init(data);
		return post;
	}

	static async init(data) {
		let post = new Post(data);
		post.user = await User.load(data.user_id);
		return post;
	}

	async save() {
		let db = require('../db');
		await db.post.update(this);
		this.data = await db.post.load(this.id);
		return this;
	}

	async remove() {
		let db = require('../db');
		await db.post.remove(this);
	}

}

module.exports = Post;
