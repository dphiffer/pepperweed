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
		let exists = await db.option.load(key, null);
		if (! exists) {
			await db.option.create(key, value);
		} else {
			await db.option.update(key, value);
		}
		this.options[key] = value;
	}

	async getOption(key) {
		let db = require('../db');
		if (typeof this.options[key] != 'undefined') {
			return this.options[key];
		}
		let value = await db.option.load(key);
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
}

module.exports = new Site();
