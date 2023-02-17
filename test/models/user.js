'use strict';

const tap = require('tap');
const fs = require('fs');
const Queries = require('../../src/db/queries');
const User = require('../../src/models/user');

tap.test('create user, load by id', async tap => {
	let create = await User.create({
		name: 'Test',
		slug: 'test1',
		email: 'test1@test.test',
		password: 'alpine123'
	});
	tap.equal(typeof create.id, 'number');
	let load = User.load(create.id);
	tap.equal(load.name, 'Test');
	tap.equal(load.slug, 'test1');
	tap.equal(load.email, 'test1@test.test');
	tap.not(load.password, 'alpine123'); // this should be hashed
});

tap.test('load user by non-existant id', tap => {
	try {
		let user = User.load(99);
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});

tap.test('load user by username', tap => {
	let user = User.load('test1');
	tap.equal(user.name, 'Test');
	try {
		user = User.load('tk-does-not-exist');
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	try {
		user = User.load('weird input');
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});

tap.test('load user by email', tap => {
	let user = User.load('test1@test.test');
	tap.equal(user.slug, 'test1');
	try {
		user = User.load('tk-does-not-exist@test.test');
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});

tap.test('pass undefined to user load', tap => {
	try {
		let user = User.load();
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});

tap.test('user check password', tap => {
	let user = User.load('test1@test.test');
	tap.ok(user.checkPassword('alpine123'));
 	tap.not(user.checkPassword('Wrong password'));
	tap.end();
});

tap.test('update user', tap => {
	let update = User.load('test1@test.test');
	update.name = 'Updated';
	update.email = 'test2@test.test';
	update.slug = 'test123';
	update.save();
	let load = User.load('test2@test.test');
	tap.equal(load.slug, 'test123');
	tap.end();
});

tap.test('delete user', tap => {
	let user = User.load('test2@test.test');
	user.remove();
	try {
		user = User.load('test2@test.test');
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});
