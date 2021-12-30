'use strict';

const Queries = require('./queries');

class UserQueries extends Queries {

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

	async create(data) {
		let db = await this.connect();
		let rsp = await db.run(`
			INSERT INTO user
			(slug, name, email, password, created, updated)
			VALUES ($slug, $name, $email, $password, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`, {
			$slug: data.slug,
			$name: data.name,
			$email: data.email,
			$password: data.password
		});
		return rsp.lastID;
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
			$name: data.name,
			$email: data.email,
			$password: data.password,
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
