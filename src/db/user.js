'use strict';

const Queries = require('./queries');

class UserQueries extends Queries {

	load(key, value) {
		let validKeys = ['id', 'email', 'slug'];
		if (validKeys.indexOf(key) == -1) {
			throw new Queries.InvalidInputError(`Cannot load user by '${key}'.`);
		}
		let db = this.connect();
		let stmt = db.prepare(`
			SELECT *
			FROM user
			WHERE ${key} = ?
		`);
		let data = stmt.get(value);
		if (! data) {
			throw new Queries.NotFoundError(`User with ${key} '${value}' not found.`);
		}
		return data;
	}

	create(user) {
		let db = this.connect();
		this.validateSlug(user.slug);
		this.validateName(user.name);
		this.validateEmail(user.email);
		this.validatePassword(user.password);
		let stmt = db.prepare(`
			INSERT INTO user
			(slug, name, email, password, created, updated)
			VALUES ($slug, $name, $email, $password, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`);
		let info = stmt.run(user);
		return info.lastInsertRowid;
	}

	update(user) {
		let db = this.connect();
		let stmt = db.prepare(`
			UPDATE user
			SET slug = $slug,
			    name = $name,
			    email = $email,
			    password = $password,
			    updated = CURRENT_TIMESTAMP
			WHERE id = $id
		`);
		return stmt.run({
			slug: user.slug,
			name: user.name,
			email: user.email,
			password: user.password,
			id: user.id
		});
	}

	remove(user) {
		let db = this.connect();
		let stmt = db.prepare(`
			DELETE FROM user
			WHERE id = ?
		`);
		return stmt.run(user.id);
	}

	validateSlug(slug) {
		let staticRoutes = [
			'register',
			'signup',
			'login',
			'logout',
			'new',
			'edit',
			'password',
			'settings'
		];
		if (! slug) {
			throw new Queries.InvalidInputError('Please enter a username.');
		}
		if (staticRoutes.indexOf(slug) > -1) {
			throw new Queries.InvalidInputError('Sorry, that is an invalid username.');
		}
		let db = this.connect();
		let stmt = db.prepare(`
			SELECT id
			FROM user
			WHERE slug = ?
		`);
		let exists = stmt.get(slug);
		if (exists) {
			throw new Queries.InvalidInputError('Sorry, that username is taken.');
		}
	}

	validateName(name) {
		if (! name) {
			throw new Queries.InvalidInputError('Please enter a name.');
		}
	}

	validateEmail(email) {
		if (! email) {
			throw new Queries.InvalidInputError('Please enter an email address.');
		}
		if (email.indexOf('@') == -1) {
			throw new Queries.InvalidInputError('Please enter a valid email address.');
		}
		let db = this.connect();
		let stmt = db.prepare(`
			SELECT id
			FROM user
			WHERE email = ?
		`);
		let exists = stmt.get(email);
		if (exists) {
			throw new Queries.InvalidInputError('Sorry, that email has already registered an account.');
		}
	}

	validatePassword(password) {
		if (! password) {
			throw new Queries.InvalidInputError('Please enter a password.');
		}
		if (password.length < 8) {
			throw new Queries.InvalidInputError('Please enter a password at least 8 characters long.');
		}
	}

	createPasswordReset(id, userId, code) {
		let db = this.connect();
		let stmt = db.prepare(`
			INSERT INTO password_reset
			(id, user_id, code, status, created, updated)
			VALUES ($id, $user_id, $code, $status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`);
		let info = stmt.run({
			id: id,
			user_id: userId,
			code: code,
			status: 'created'
		});
		return this.loadPasswordReset(id);
	}

	loadPasswordReset(id) {
		let db = this.connect();
		let stmt = db.prepare(`
			SELECT *
			FROM password_reset
			WHERE id = ?
		`);
		return stmt.get(id);
	}

	updatePasswordReset(id, status) {
		let db = this.connect();
		let stmt = db.prepare(`
			UPDATE password_reset
			SET status = $status
			WHERE id = $id
		`);
		return stmt.run({
			id: id,
			status: status
		});
	}

}

module.exports = connect => {
	return new UserQueries(connect);
};
