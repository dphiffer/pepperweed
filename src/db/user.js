'use strict';

const Queries = require('./queries');

class UserQueries extends Queries {

	async query(args = {}) {
		let db = await this.connect();
		let query = await db.all(`
			SELECT *
			FROM user
			ORDER BY created DESC
			LIMIT 10
		`);
		return query;
	}

	async load(key, value) {
		let validKeys = ['id', 'email', 'slug'];
		if (validKeys.indexOf(key) == -1) {
			throw new Queries.InvalidInputError(`Cannot load user by '${key}'`);
		}
		let db = await this.connect();
		let data = await db.get(`
			SELECT *
			FROM user
			WHERE ${key} = ?
		`, value);
		if (! data) {
			throw new Queries.NotFoundError(`User with ${key} '${value}' not found`);
		}
		return data;
	}

	async create(user) {
		let db = await this.connect();
		let rsp = await db.run(`
			INSERT INTO user
			(slug, name, email, password, created, updated)
			VALUES ($slug, $name, $email, $password, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`, {
			$slug: user.data.slug,
			$name: user.data.name,
			$email: user.data.email,
			$password: user.data.password
		});
		return rsp;
	}

	async update(user) {
		let db = await this.connect();
		let data = await this.load('id', user.id);
		data = Object.assign(data, user.data);
		let rsp = await db.run(`
			UPDATE user
			SET slug = $slug,
			    name = $name,
			    email = $email,
			    password = $password,
			    updated = CURRENT_TIMESTAMP
			WHERE id = $id
		`, {
			$slug: data.slug,
			$title: data.title,
			$id: user.id
		});
		return rsp;
	}

	async remove(user) {
		let db = await this.connect();
		let rsp = await db.run(`
			DELETE FROM user
			WHERE id = ?
		`, user.id);
		return rsp;
	}

}

module.exports = connect => {
	return new UserQueries(connect);
};
