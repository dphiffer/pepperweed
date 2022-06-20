'use strict';

const tap = require('tap');
const Queries = require('../../src/db/queries');

tap.test('load user by invalid key', async tap => {
	let db = require('../../src/db');
	try {
		let user = await db.user.load('non-existant', 'value');
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
});

tap.test('validate empty values', async tap => {
	let db = require('../../src/db');
	try {
		await db.user.validateSlug('');
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
	try {
		await db.user.validateName('');
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
	try {
		await db.user.validateEmail('');
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
});

tap.test('validate email without @ sign', async tap => {
	let db = require('../../src/db');
	try {
		await db.user.validateEmail('email');
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
});

tap.test('validate password', async tap => {
	let db = require('../../src/db');
	try {
		await db.user.validatePassword('');
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
	try {
		await db.user.validatePassword('1234567');
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
});

tap.test('check for signup duplicates', async tap => {
	let db = require('../../src/db');
	await db.user.create({
		name: 'duplicate',
		slug: 'duplicate',
		email: 'duplicate@email',
		password: 'duplicate'
	});
	try {
		await db.user.create({
			name: 'duplicate',
			slug: 'duplicate',
			email: 'unique@email',
			password: 'duplicate'
		});
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
	try {
		await db.user.create({
			name: 'duplicate',
			slug: 'unique',
			email: 'duplicate@email',
			password: 'duplicate'
		});
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
});

tap.test('check for smartass usernames', async tap => {
	let db = require('../../src/db');
	try {
		await db.user.validateSlug('login');
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
});
