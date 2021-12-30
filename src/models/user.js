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

	static async create(data) {
		let db = require('../db');
		let bcrypt = require('bcrypt');
		let saltRounds = 10;
		data.password = await bcrypt.hash(data.password, saltRounds);
		data.id = await db.user.create(data);
		return new User(data);
	}

	static async current(req) {
		let id = req.session.get('user');
		if (id) {
			let user = await User.load(id);
			return user;
		} else {
			return null;
		}
	}

	static async load(id) {
		let db = require('../db');
		let data = null;
		let emailRegex = /^\w+@\w+\.\w+$/;
		let slugRegex = /^[a-z0-9_-]+$/i;
		if (typeof id == 'number') {
			data = await db.user.load('id', id);
		} else if (typeof id == 'string') {
			if (id.match(emailRegex)) {
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

	async save() {
		let db = require('../db');
		await db.user.update(this);
		this.data = await db.user.load('id', this.id);
		return this;
	}

	async checkPassword(password) {
		let bcrypt = require('bcrypt');
		let result = await bcrypt.compare(password, this.data.password);
		return result;
	}

	async remove() {
		let db = require('../db');
		await db.user.remove(this);
	}

}

module.exports = User;
