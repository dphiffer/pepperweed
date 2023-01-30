'use strict';

const tap = require('tap');
const Queries = require('../../src/db/queries');
const TextPost = require('../../src/models/post/text');
const Post = require('../../src/models/post');
const User = require('../../src/models/user');

tap.test('create user and text post', async tap => {
	let user = await User.create({
		name: 'Post Maker',
		slug: 'pmaker',
		email: 'pmaker@test.test',
		password: 'alpine'
	});

	let post = await Post.create(user, 'text');
	tap.equal(post.id, 1);
	tap.match(post, {
		url: /^\/pmaker\/[a-z0-9]{40}$/,
		edit_url: /^\/edit\/1$/
	});
});

tap.test('load post by id', async tap => {
	let p1 = await Post.load(1);
	tap.equal(p1.id, 1);

	try {
		let p2 = await Post.load(99);
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('update post', async tap => {
	let p1 = await Post.load(1);
	let created = p1.created;
	let updated = p1.updated;

	p1.data.title = 'Testing';
	p1.data.slug = 'test';
	await p1.save();

	let p2 = await Post.load(1);
	tap.equal(p2.title, 'Testing');
	tap.equal(p2.slug, 'test');
});

tap.test('load post by slug', async tap => {
	let p1 = await Post.load('test');
	tap.equal(p1.id, 1);

	try {
		let p2 = await Post.load('non-existant');
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('query posts', async tap => {
	let posts = await Post.query();
	tap.equal(posts.length, 1);
	tap.equal(posts[0].slug, 'test');
});

tap.test('delete post', async tap => {
	let post = await Post.load(1);
	await post.remove();

	let posts = await Post.query();
	tap.equal(posts.length, 0);
});

tap.test('invalid post type', async tap => {
	let user = await User.load(1);

	try {
		let user = await User.load(1);
		let post = await Post.create(user, 'invalid');
	} catch (err) {
		tap.equal(err instanceof Post.UnknownPostType, true);
	}

	try {
		let post = await Post.init({
			type: 'invalid'
		});
	} catch (err) {
		tap.equal(err instanceof Post.UnknownPostType, true);
	}
});
