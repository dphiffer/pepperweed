'use strict';

let dbname;

class Post {

	id = null;
	data = {};

	constructor(data) {
		if (data && typeof data != 'object') {
			this.data = {
				id: data
			};
		} else {
			this.data = data || {};
		}
		this.id = this.data.id || null;
		delete this.data.id;
	}

	async load() {
		if (this.id) {
			let db = require('../db');
			let data = await db.post.load(this.id);
			Object.assign(this.data, data);
		}
	}

	async save() {
		let db = require('../db');
		await db.post.save(this);
	}

}

module.exports = async _dbname => {
	//await Post.load_fields();
	return Post;
};
