'use strict';

const tap = require('tap');
const db = require('../../src/db');
const Queries = require('../../src/db/queries');

tap.test('create then query post', tap => {
	let user = {
		id: 1
	};
	db.post.create(user, 'query-test', {test: 'query'});
	let posts = db.post.query();
	tap.equal(posts[0].slug, 'query-test');
	tap.end();
});

tap.test('load non-existant post', tap => {
	try {
		let post = db.post.load('slug', 'tk-does-not-exist');
	} catch(err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});

tap.test('load post by invalid key', tap => {
	try {
		let post = db.post.load(1);
	} catch(err) {
		tap.ok(err instanceof Queries.InvalidInputError);
	}
	tap.end();
});

tap.test('update post', tap => {
	let user = {
		id: 1
	};
	let post = db.post.create(user, 'update-test', {test: 'update'});
	post.title = 'Updated post';
	post.attributes.test = 'updated';
	db.post.update(post);
	let updated = db.post.load('id', post.id);
	tap.equal(post.title, 'Updated post');
	tap.equal(post.attributes.test, 'updated');
	tap.end();
});

tap.test('delete post', tap => {
	let user = {
		id: 1
	};
	let post = db.post.create(user, 'delete-test', {test: 'delete'});
	db.post.remove(post);
	try {
		let deleted = db.post.load('id', post.id);
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});
