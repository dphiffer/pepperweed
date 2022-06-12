'use strict';

import sodium from 'sodium-native';
import db from '../db/index.js';

class Site {

	options = {};

	async setup() {
		this.options = await db.option.all();
		let sessionKey = await this.getOption('sessionKey');
		if (! sessionKey) {
			let buffer = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);
			sodium.randombytes_buf(buffer);
			await this.setOption('sessionKey', buffer.toString('hex'));
		}
	}

	async setOption(key, value) {
		let exists = await db.option.load(key, null);
		if (! exists) {
			await db.option.create(key, value);
		} else {
			await db.option.update(key, value);
		}
		this.options[key] = value;
	}

	async getOption(key) {
		if (typeof this.options[key] != 'undefined') {
			return this.options[key];
		}
		let value = await db.option.load(key);
		this.options[key] = value;
		return value;
	}

	async removeOption(key) {
		if (typeof this.options[key] != 'undefined') {
			delete this.options[key];
		}
		await db.option.remove(key);
	}
}

export default new Site();
