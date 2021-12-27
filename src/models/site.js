'use strict';

class Site {

	options = {};

	async setup() {
		let db = require('../db');
		this.options = await db.option.all();
		let sessionKey = await this.getOption('sessionKey');
		if (! sessionKey) {
			let sodium = require('sodium-native');
			let buffer = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);
			sodium.randombytes_buf(buffer);
			await this.setOption('sessionKey', buffer.toString('hex'));
		}
	}

	async setOption(key, value) {
		let db = require('../db');
		let exists = await db.option.load(key);
		if (! exists) {
			await db.option.create(key, value);
		} else {
			await db.option.update(key, value);
		}
		this.options[key] = value;
	}

	async getOption(key, defaultValue = null) {
		let db = require('../db');
		if (key in this.options) {
			return this.options[key];
		}
		let value = await db.option.load(key);
		if (value != null) {
			return value;
		}
		return defaultValue;
	}
}

module.exports = new Site();
