'use strict';

const Queries = require('./queries');

class UserQueries extends Queries {

	async load(key, value) {
		let validKeys = ['id', 'email', 'slug'];
		if (validKeys.indexOf(key) == -1) {
			throw new Queries.InvalidInputError(`Cannot load user by '${key}'.`);
		}
		let db = await this.connect();
		let data = await db.get(`
			SELECT *
			FROM user
			WHERE ${key} = ?
		`, value);
		if (! data) {
			throw new Queries.NotFoundError(`User with ${key} '${value}' not found.`);
		}
		return data;
	}

	async create(data) {
		let db = await this.connect();
		await this.validateSlug(data.slug);
		await this.validateName(data.name);
		await this.validateEmail(data.email);
		await this.validatePassword(data.password);
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

	async validateSlug(slug) {
		let staticRoutes = [
			'signup',
			'login',
			'logout',
			'new',
			'edit'
		];
		if (! slug) {
			throw new Queries.InvalidInputError('Please enter a username.');
		}
		if (staticRoutes.indexOf(slug) > -1) {
			throw new Queries.InvalidInputError('Sorry, that is an invalid username.');
		}
		let db = await this.connect();
		let exists = await db.get(`
			SELECT id
			FROM user
			WHERE slug = ?
		`, slug);
		if (exists) {
			throw new Queries.InvalidInputError('Sorry, that username is taken.');
		}
	}

	async validateName(name) {
		if (! name) {
			throw new Queries.InvalidInputError('Please enter a name.');
		}
	}

	async validateEmail(email) {
		if (! email) {
			throw new Queries.InvalidInputError('Please enter an email address.');
		}
		if (email.indexOf('@') == -1) {
			throw new Queries.InvalidInputError('Please enter a valid email address.');
		}
		let db = await this.connect();
		let exists = await db.get(`
			SELECT id
			FROM user
			WHERE email = ?
		`, email);
		if (exists) {
			throw new Queries.InvalidInputError('Sorry, that email has already registered an account.');
		}
	}

	async validatePassword(password) {
		if (! password) {
			throw new Queries.InvalidInputError('Please enter a password.');
		}
		if (password.length < 8) {
			throw new Queries.InvalidInputError('Please enter a password at least 8 characters long.');
		}
	}

	async createPasswordReset(id, user_id, code) {
		let db = await this.connect();
		let rsp = await db.run(`
			INSERT INTO password_reset
			(id, user_id, code, status, created, updated)
			VALUES ($id, $user_id, $code, $status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`, {
			$id: id,
			$user_id: user_id,
			$code: code,
			$status: 'created'
		});
		let reset = await this.loadPasswordReset(rsp.lastID);
		return reset;
	}

	async loadPasswordReset(id) {
		let db = await this.connect();
		let data = await db.get(`
			SELECT *
			FROM password_reset
			WHERE id = ?
		`, id);
		if (data) {
			await this.updatePasswordReset(id, 'loaded');
		}
		return data;
	}

	async updatePasswordReset(id, status) {
		let db = await this.connect();
		let rsp = await db.run(`
			UPDATE password_reset
			SET status = $status
			WHERE id = $id
		`, {
			$id: id,
			$status: status
		});
		return rsp;
	}

}

module.exports = connect => {
	return new UserQueries(connect);
};
