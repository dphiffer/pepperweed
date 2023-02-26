'use strict';

const crypto = require('crypto');
const moment = require('moment-timezone');
const Base = require('./base');
const User = require('../models/user');
const db = require('../db');

class Post extends Base {

	static UnknownPostType = class extends Error {};
	static types = {};

	get slug() {
		return this.data.slug;
	}

	set slug(slug) {
		this.data.slug = slug;
	}

	get title() {
		return this.data.title;
	}

	set title(title) {
		this.data.title = title;
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
		return `/edit/${this.id}`;
	}

	get date_formatted() {
		let created = moment.tz(this.created, 'UTC');
		return created.tz('America/New_York').format('YYYY-MM-DD');
	}

	get time_formatted() {
		let created = moment.tz(this.created, 'UTC');
		return created.tz('America/New_York').format('YYYY-MM-DD h:mma z');
	}

	static query(args = {}) {
		return db.post.query(args)
		       .map(data => Post.init(data));
	}

	static create(user, type) {
		if (! Post.types[type]) {
			throw new Post.UnknownPostType(`Unknown post type '${type}'`);
		}
		let PostClass = Post.types[type];
		let slug = crypto.randomBytes(20).toString('hex');
		let attributes = PostClass.attributes();
		return Post.init(db.post.create(user, slug, attributes));
	}

	static load(id) {
		let data;
		if (typeof id == 'number') {
			data = db.post.load('id', id);
		} else {
			data = db.post.load('slug', id);
		}
		return Post.init(data);
	}

	static init(data) {
		let attributes = data.attributes || {};
		if (! Post.types[attributes.type]) {
			throw new Post.UnknownPostType(`Unknown post type '${attributes.type}'`);
		}
		let PostClass = this.types[attributes.type];
		let post = new PostClass(data);
		post.user = User.load(data.user_id);
		post.init(attributes);
		return post;
	}

	static registerType(type, typeClass) {
		this.types[type] = typeClass;
	}

	save() {
		db.post.update(this);
		this.data = db.post.load('id', this.id);
		return this;
	}

	remove() {
		db.post.remove(this);
	}

}

module.exports = Post;
