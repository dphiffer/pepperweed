'use strict';

import crypto from 'crypto';
import dateFormat from 'dateformat';
import db from '../db/index.js';
import Base from './base.js';
import User from '../models/user.js';

class Post extends Base {

	static UnknownPostType = class extends Error {};
	static types = {};

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
		return dateFormat(this.created, 'mmm d, yyyy');
	}

	get time_formatted() {
		return dateFormat(this.created, 'h:MMtt');
	}

	static async query(args = {}) {
		let query = await db.post.query(args);
		let posts = [];
		for (let data of query) {
			let post = await Post.init(data);
			posts.push(post);
		}
		return posts;
	}

	static async create(user, type) {
		if (! Post.types[type]) {
			throw new Post.UnknownPostType(`Unknown post type '${type}'`);
		}

		let PostClass = Post.types[type];

		let slug = crypto.randomBytes(20).toString('hex');
		let attributes = PostClass.attributes();
		let data = await db.post.create(user, slug, attributes);
		data.attributes = attributes;
		let post = await Post.init(data);
		return post;
	}

	static async load(id) {
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
		let attributes = data.attributes || {};
		if (! Post.types[attributes.type]) {
			throw new Post.UnknownPostType(`Unknown post type '${attributes.type}'`);
		}
		let PostClass = this.types[attributes.type];
		let post = new PostClass(data);
		post.user = await User.load(data.user_id);
		post.initAttributes(attributes);
		return post;
	}

	static registerType(type, typeClass) {
		this.types[type] = typeClass;
	}

	async save() {
		await db.post.update(this);
		this.data = await db.post.load('id', this.id);
		return this;
	}

	async remove() {
		await db.post.remove(this);
	}

}

export default Post;
