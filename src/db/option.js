'use strict';

const Queries = require('./queries');

class OptionQueries extends Queries {

	async all() {
		let db = await this.connect();
		let rsp = await db.all(`
			SELECT key, value
			FROM option
		`);
		return rsp;
	}

	async load(key, defaultValue = null) {
		let db = await this.connect();
		let rsp = await db.get(`
			SELECT value
			FROM option
			WHERE key = ?
		`, key);
		if (! rsp) {
			return defaultValue;
		}
		return rsp.value;
	}

	async create(key, value) {
		let db = await this.connect();
		await db.run(`
			INSERT INTO option
			(key, value, created, updated)
			VALUES ($key, $value, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`, {
			$key: key,
			$value: value
		});
	}

	async update(key, value) {
		let db = await this.connect();
		await db.run(`
			UPDATE option
			SET value = $value,
			    updated = CURRENT_TIMESTAMP
			WHERE key = $key
		`, {
			$key: key,
			$value: value
		});
	}

	async remove(key) {
		let db = await this.connect();
		await db.run(`
			DELETE FROM option
			WHERE key = ?
		`, key);
	}

}

module.exports = (connect) => {
	return new OptionQueries(connect);
};
