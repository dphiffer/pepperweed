'use strict';

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Base = require('./base');
const Queries = require('../db/queries');

class User extends Base {

	get slug() {
		return this.data.slug;
	}

	set slug(slug) {
		this.data.slug = slug;
	}

	get name() {
		return this.data.name;
	}

	set name(name) {
		this.data.name = name;
	}

	get email() {
		return this.data.email;
	}

	set email(email) {
		this.data.email = email;
	}

	get password() {
		return this.data.password;
	}

	set password(password) {
		this.data.password = password;
	}

	static async create(data) {
		let db = require('../db');
		let bcrypt = require('bcrypt');
		let saltRounds = 10;
		data.password = await bcrypt.hash(data.password, saltRounds);
		data.id = db.user.create(data);
		return new User(data);
	}

	static current(req) {
		let id = req.session.get('user');
		if (id) {
			return User.load(id);
		} else {
			return null;
		}
	}

	static load(id) {
		let db = require('../db');
		let data = null;
		let emailRegex = /^\w+@\w+\.\w+$/;
		let slugRegex = /^[a-z0-9_-]+$/i;
		if (typeof id == 'number') {
			data = db.user.load('id', id);
		} else if (typeof id == 'string') {
			if (id.match(emailRegex)) {
				data = db.user.load('email', id);
			} else if (id.match(slugRegex)) {
				data = db.user.load('slug', id);
			}
		}
		if (! data) {
			throw new Queries.NotFoundError(`User '${id}' not found`);
		}
		return new User(data);
	}

	static resetPassword(app, email) {
		let db = require('../db');
		let user = User.load(email);
		let id = crypto.randomBytes(20).toString('hex');
		let code = Math.floor(Math.random() * 1000000);
		code = ('000000' + code).substr(-6, 6);
		app.site.mailer.sendMail({
			from: app.site.fromEmail,
			to: email,
			subject: `${app.site.title} password reset`,
			text: `Your password reset code is: ${code}`
		});
		db.user.createPasswordReset(id, user.id, code);
		return id;
	}

	static checkPasswordReset(id, code) {
		let db = require('../db');
		let reset = db.user.loadPasswordReset(id);
		if (reset && reset.code == code) {
			db.user.updatePasswordReset(id, 'done');
			return User.load(reset.user_id);
		}
		return null;
	}

	save() {
		let db = require('../db');
		db.user.update(this);
		this.data = db.user.load('id', this.id);
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
		this.password = await bcrypt.hash(password, saltRounds);
		this.save();
		return this;
	}

	remove() {
		let db = require('../db');
		db.user.remove(this);
	}

}

module.exports = User;
