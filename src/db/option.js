'use strict';

const Queries = require('./queries');

class OptionQueries extends Queries {

	all() {
		let db = this.connect();
		let stmt = db.prepare(`
			SELECT key, value
			FROM option
		`);
		let rsp = stmt.all();
		let options = {};
		for (let option of rsp) {
			options[option.key] = option.value;
		}
		return options;
	}

	load(key, defaultValue = null) {
		let db = this.connect();
		let stmt = db.prepare(`
			SELECT value
			FROM option
			WHERE key = ?
		`);
		let rsp = stmt.get(key);
		if (! rsp) {
			return defaultValue;
		}
		return rsp.value;
	}

	create(key, value) {
		let db = this.connect();
		let stmt = db.prepare(`
			INSERT INTO option
			(key, value, created, updated)
			VALUES ($key, $value, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`);
		stmt.run({
			key: key,
			value: value
		});
	}

	update(key, value) {
		let db = this.connect();
		let stmt = db.prepare(`
			UPDATE option
			SET value = $value,
			    updated = CURRENT_TIMESTAMP
			WHERE key = $key
		`);
		return stmt.run({
			key: key,
			value: value
		});
	}

	remove(key) {
		let db = this.connect();
		let stmt = db.prepare(`
			DELETE FROM option
			WHERE key = ?
		`);
		return stmt.run(key);
	}

}

module.exports = (connect) => {
	return new OptionQueries(connect);
};
