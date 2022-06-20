'use strict';

const tap = require('tap');
const fs = require('fs');
const Queries = require('../../src/db/queries');
const User = require('../../src/models/user');

tap.test('create user, load by id', async tap => {
	let u1 = await User.create({
		name: 'Test',
		slug: 'test',
		email: 'test@test.test',
		password: 'Hello world'
	});
	tap.equal(typeof u1.id, 'number');

	let u2 = await User.load(u1.id);
	tap.equal(u2.email, 'test@test.test');
});

tap.test('load user by non-existant id', async tap => {
	try {
		let user = await User.load(99);
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('load user by username', async tap => {
	let u1 = await User.load('test');
	tap.equal(u1.name, 'Test');

	try {
		let u2 = await User.load('does-not-exist');
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}

	try {
		let u3 = await User.load('weird input');
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('load user by email', async tap => {
	let u1 = await User.load('test@test.test');
	tap.equal(u1.slug, 'test');

	try {
		let u2 = await User.load('does-not-exist@test.test');
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('pass undefined to user load', async tap => {
	try {
		let user = await User.load();
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('user login', async tap => {
	let user = await User.load('test@test.test');
	let r1 = await user.checkPassword('Hello world');
	tap.equal(r1, true);

	let r2 = await user.checkPassword('Wrong password');
	tap.equal(r2, false);
});

tap.test('update user', async tap => {
	let u1 = await User.load('test@test.test');
	u1.data.slug = 'test2';
	await u1.save();

	let u2 = await User.load('test@test.test');
	tap.equal(u2.slug, 'test2');
});

tap.test('delete user', async tap => {
	let u1 = await User.load('test@test.test');
	await u1.remove();

	try {
		let u2 = await User.load('test@test.test');
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});
