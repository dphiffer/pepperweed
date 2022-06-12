'use strict';

import bcrypt from 'bcrypt';
import db from '../db/index.js';
import Base from './base.js';
import Queries from '../db/queries.js';

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
		await db.user.update(this);
		this.data = await db.user.load('id', this.id);
		return this;
	}

	async checkPassword(password) {
		let result = await bcrypt.compare(password, this.data.password);
		return result;
	}

	async remove() {
		await db.user.remove(this);
	}

}

export default User;
