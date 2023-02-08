'use strict';

const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

	static async resetPassword(app, email) {
		let db = require('../db');
		let user = await User.load(email);
		let id = crypto.randomBytes(20).toString('hex');
		let code = Math.floor(Math.random() * 1000000);
		code = ('000000' + code).substr(-6, 6);
		app.site.mailer.sendMail({
			from: app.site.fromEmail,
			to: email,
			subject: `${app.site.title} password reset`,
			text: `Your password reset code is: ${code}`
		});
		await db.user.createPasswordReset(id, user.id, code);
		return id;
	}

	static async checkPasswordReset(id, code) {
		let db = require('../db');
		let reset = await db.user.loadPasswordReset(id);
		if (reset && reset.code == code) {
			let db = require('../db');
			await db.user.updatePasswordReset(id, 'done');
			let user = await User.load(reset.user_id);
			return user;
		}
		return null;
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

	async setPassword(password) {
		let bcrypt = require('bcrypt');
		let saltRounds = 10;
		this.data.password = await bcrypt.hash(password, saltRounds);
		await this.save();
		return this;
	}

	async remove() {
		let db = require('../db');
		await db.user.remove(this);
	}

}

module.exports = User;
