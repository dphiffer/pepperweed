'use strict';

const crypto = require('crypto');
const moment = require('moment-timezone');
const Base = require('./base');
const User = require('../models/user');

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

	get edit_url() {
		return `/${this.user.slug}/${this.slug}/edit`;
	}

	get date_formatted() {
		let created = moment.tz(this.created, 'UTC');
		return created.tz('America/New_York').format('YYYY-MM-DD');
	}

	get time_formatted() {
		let created = moment.tz(this.created, 'UTC');
		return created.tz('America/New_York').format('YYYY-MM-DD h:mma z');
	}

	static async query(args = {}) {
		let db = require('../db');
		let query = await db.post.query(args);
		let posts = [];
		for (let data of query) {
			let post = await Post.init(data);
			posts.push(post);
		}
		return posts;
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
		let data = {};
		if (typeof id == 'number') {
			data = await db.post.load('id', id);
		} else {
			data = await db.post.load('slug', id);
		}
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
		this.data = await db.post.load('id', this.id);
		return this;
	}

	async remove() {
		let db = require('../db');
		await db.post.remove(this);
	}

}

module.exports = Post;
