'use strict';

const nodemailer = require('nodemailer');
const User = require('./user');
const TextPost = require('./post/text');

class Site {

	options = {};
	user = null;

	get title() {
		return this.options.title;
	}

	get fromEmail() {
		return this.options.fromEmail;
	}

	get smtpConfig() {
		return this.options.smtpConfig;
	}

	async setup() {
		let db = require('../db');
		this.options = await db.option.all();
		await this.setupSessions();
		await this.setupMailer();
	}

	async setupSessions() {
		let sessionKey = await this.getOption('sessionKey');
		if (! sessionKey) {
			let sodium = require('sodium-native');
			let buffer = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);
			sodium.randombytes_buf(buffer);
			await this.setOption('sessionKey', buffer.toString('hex'));
		}
	}

	setupMailer(config = null) {
		if (! config) {
			config = {
				sendmail: true,
				newline: 'unix',
				path: '/usr/sbin/sendmail'
			};
			if (this.smtpConfig) {
				config = this.smtpConfig;
			}
		}
		this.mailer = nodemailer.createTransport(config);
	}

	async setOption(key, value) {
		let db = require('../db');
		let exists = await db.option.load(key, null);
		if (! exists) {
			await db.option.create(key, value);
		} else {
			await db.option.update(key, value);
		}
		this.options[key] = value;
	}

	async getOption(key, defaultValue = null) {
		let db = require('../db');
		if (typeof this.options[key] != 'undefined') {
			return this.options[key];
		}
		let value = await db.option.load(key, defaultValue);
		this.options[key] = value;
		return value;
	}

	async removeOption(key) {
		let db = require('../db');
		if (typeof this.options[key] != 'undefined') {
			delete this.options[key];
		}
		await db.option.remove(key);
	}

	async checkUser(req) {
		this.user = await User.current(req);
		return this.user;
	}
}

module.exports = new Site();
