'use strict';

const tap = require('tap');
const Queries = require('../../src/db/queries');
const Post = require('../../src/models/post');

tap.test('create post', async tap => {
	let post = new Post({
		slug: 'hello-world',
		title: 'Hello world'
	});
	await post.save();
	tap.equal(post.id, 1);
});

tap.test('load post by id', async tap => {
	let p1 = await Post.load(1);
	tap.equal(p1.title, 'Hello world');

	try {
		let p2 = await Post.load(99);
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('update post', async tap => {
	let p1 = await Post.load(1);
	p1.data.slug = 'test';
	await p1.save();
	let created = p1.created;
	let updated = p1.updated;

	let p2 = await Post.load(1);
	tap.equal(p2.slug, 'test');
	tap.equal(p2.title, 'Hello world');
	tap.equal(p2.created, created);
	tap.equal(p2.updated, updated);
});

tap.test('query posts', async tap => {
	let posts = await Post.query();
	tap.equal(posts.length, 1);
	tap.equal(posts[0].title, 'Hello world');
});

tap.test('delete post', async tap => {
	let post = await Post.load(1);
	await post.remove();

	let posts = await Post.query();
	tap.equal(posts.length, 0);
});
