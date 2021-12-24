'use strict';

const Base = require('./base');
const Queries = require('../db/queries');

class User extends Base {

	get slug() {
		return this.data.slug;
	}

	get name() {
		return this.data.name;
	}

	get email() {
		return this.data.email;
	}

	static async current(req) {
		let id = req.session.get('user');
		if (id) {
			try {
				let user = await User.load(id);
				return user;
			} catch(err) {
				return null;
			}
		} else {
			return null;
		}
	}

	static async query(args = {}) {
		let db = require('../db');
		let query = await db.user.query(args);
		return query.map(data => new User(data));
	}

	static async load(id) {
		let db = require('../db');
		let data = null;
		let idRegex = /^\d+$/;
		let emailRegex = /^\w+@\w+\.\w+$/;
		let slugRegex = /^[a-z0-9_-]+$/i;
		if (typeof id == "number") {
			data = await db.user.load('id', id);
		} else if (typeof id == "string") {
			if (id.match(idRegex)) {
				data = await db.user.load('id', parseInt(id));
			} else if (id.match(emailRegex)) {
				data = await db.user.load('email', id);
			} else if (id.match(slugRegex)) {
				data = await db.user.load('slug', id);
			}
		}
		if (! data) {
			throw new Queries.NotFoundError(`User '${id}' not found`);
		}
		return new User(data);
	}

	static async hashPassword(plainText) {
		let bcrypt = require('bcrypt');
		let saltRounds = 10;
		let hash = await bcrypt.hash(plainText, saltRounds);
		return hash;
	}

	async save() {
		let db = require('../db');
		if (this.id) {
			await db.user.update(this);
			this.data = await db.user.load('id', this.id);
		} else {
			let rsp = await db.user.create(this);
			this.id = rsp.lastID;
		}
		return this;
	}

	async checkPassword(password) {
		let bcrypt = require('bcrypt');
		let result = await bcrypt.compare(password, this.data.password);
		return result;
	}

	async remove() {
		if (this.id) {
			let db = require('../db');
			await db.user.remove(this);
		}
	}

}

module.exports = User;
