'use strict';

const tap = require('tap');
const db = require('../../src/db');
const Queries = require('../../src/db/queries');

tap.test('create and load user', tap => {
	let userId = db.user.create({
		slug: 'create-user',
		name: 'Create User',
		email: 'create@test.test',
		password: 'alpine123'
	});
	let user = db.user.load('id', userId);
	tap.equal(user.id, userId);
	tap.equal(user.slug, 'create-user');
	tap.equal(user.name, 'Create User');
	tap.equal(user.email, 'create@test.test');
	tap.equal(user.password, 'alpine123');
	tap.end();
});

tap.test('load non-existant user', tap => {
	try {
		let user = db.user.load('email', 'tk-not-exists@test.test');
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});

tap.test('load user by invalid key', tap => {
	try {
		let user = db.user.load('non-existant', 'value');
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	tap.end();
});

tap.test('update user', tap => {
	let userId = db.user.create({
		slug: 'update-user',
		name: 'Update User',
		email: 'update@test.test',
		password: 'alpine123'
	});
	let user = db.user.load('id', userId);
	user.slug = 'updated-user';
	user.name = 'Updated User';
	user.email = 'updated@test.test';
	user.password = 'updated123';
	let info = db.user.update(user);

	let updated = db.user.load('id', userId);
	tap.equal(updated.slug, 'updated-user');
	tap.equal(updated.name, 'Updated User');
	tap.equal(updated.email, 'updated@test.test');
	tap.equal(updated.password, 'updated123');
	tap.end();
});

tap.test('delete user', tap => {
	let userId = db.user.create({
		slug: 'delete-user',
		name: 'Delete User',
		email: 'delete@test.test',
		password: 'alpine123'
	});
	let user = db.user.load('id', userId);
	tap.equal(user.slug, 'delete-user');
	db.user.remove(user);
	try {
		let deleted = db.user.load('id', userId);
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});

tap.test('password reset', tap => {
	let resetId = 'test-reset-code';
	let userId = 1;
	let code = '123456';
	let reset = db.user.createPasswordReset(resetId, userId, code);
	tap.equal(reset.id, resetId);
	tap.equal(reset.user_id, userId);
	tap.equal(reset.code, code);
	tap.equal(reset.status, 'created');

	db.user.updatePasswordReset(resetId, 'updated');
	reset = db.user.loadPasswordReset(resetId);
	tap.equal(reset.status, 'updated');
	tap.end();
});

tap.test('validate empty values', tap => {
	try {
		db.user.validateSlug('');
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	try {
		db.user.validateName('');
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	try {
		db.user.validateEmail('');
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	tap.end();
});

tap.test('validate email without @ sign', tap => {
	try {
		db.user.validateEmail('email');
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	tap.end();
});

tap.test('validate password', tap => {
	try {
		db.user.validatePassword('');
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	try {
		db.user.validatePassword('1234567');
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	tap.end();
});

tap.test('check for signup duplicates', tap => {
	db.user.create({
		name: 'duplicate',
		slug: 'duplicate',
		email: 'duplicate@email',
		password: 'duplicate'
	});
	try {
		db.user.create({
			name: 'duplicate',
			slug: 'duplicate',
			email: 'unique@email',
			password: 'duplicate'
		});
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	try {
		db.user.create({
			name: 'duplicate',
			slug: 'unique',
			email: 'duplicate@email',
			password: 'duplicate'
		});
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	tap.end();
});

tap.test('check for smartass usernames', tap => {
	try {
		db.user.validateSlug('login');
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	tap.end();
});
