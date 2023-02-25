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

	get signupEnabled() {
		return (this.options.signupEnabled == '1');
	}

	setup() {
		let db = require('../db');
		this.options = db.option.all();
		this.setupSessions();
		this.setupMailer();
	}

	setupSessions() {
		let sessionKey = this.getOption('sessionKey');
		if (! sessionKey) {
			let sodium = require('sodium-native');
			let buffer = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);
			sodium.randombytes_buf(buffer);
			this.setOption('sessionKey', buffer.toString('hex'));
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

	setOption(key, value) {
		let db = require('../db');
		let exists = db.option.load(key, null);
		if (! exists) {
			db.option.create(key, value);
		} else {
			db.option.update(key, value);
		}
		this.options[key] = value;
	}

	getOption(key, defaultValue = null) {
		let db = require('../db');
		if (typeof this.options[key] != 'undefined') {
			return this.options[key];
		}
		let value = db.option.load(key, defaultValue);
		this.options[key] = value;
		return value;
	}

	removeOption(key) {
		let db = require('../db');
		if (typeof this.options[key] != 'undefined') {
			delete this.options[key];
		}
		db.option.remove(key);
	}

	checkUser(req) {
		this.user = User.current(req);
		return this.user;
	}
}

module.exports = new Site();
