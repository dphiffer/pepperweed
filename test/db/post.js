'use strict';

const tap = require('tap');
const db = require('../../src/db');
const Queries = require('../../src/db/queries');

var postId;

tap.test('create then query post', tap => {
	let user = {
		id: 1
	};
	let post = db.post.create(user, 'query-test', {
		type: 'text'
	});
	postId = post.id;
	let posts = db.post.query();
	tap.ok(posts.length > 0);
	tap.equal(typeof posts[0].slug, 'string');
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
	let post = db.post.load('id', postId)
	post.title = 'Updated post';
	db.post.update(post);
	let updated = db.post.load('id', postId);
	tap.equal(post.title, 'Updated post');
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
