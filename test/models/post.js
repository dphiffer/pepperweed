'use strict';

const tap = require('tap');
const Queries = require('../../src/db/queries');
const TextPost = require('../../src/models/post/text');
const Post = require('../../src/models/post');
const User = require('../../src/models/user');

var userId;
var postId;

tap.test('create a post', async tap => {
	let user = await User.create({
		slug: 'post-creator',
		name: 'Post Creator',
		email: 'post_creator@test.test',
		password: 'alpine123'
	});
	userId = user.id;
	let post = Post.create(user, 'text');
	postId = post.id;
	tap.match(post, {
		url: /^\/post-creator\/[a-z0-9]{40}$/,
		edit_url: new RegExp(`^/edit/${postId}$`)
	});
});

tap.test('load post by id', tap => {
	let post = Post.load(postId);
	tap.equal(post.id, postId);
	try {
		post = Post.load(99);
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});

tap.test('update post', tap => {
	let post = Post.load(postId);
	post.title = 'Testing';
	post.slug = 'test';
	post.save();
	let updated = Post.load(postId);
	tap.equal(updated.title, 'Testing');
	tap.equal(updated.slug, 'test');
	tap.end();
});

tap.test('load post by slug', tap => {
	let post = Post.load('test');
	tap.equal(post.id, postId);
	try {
		post = Post.load('non-existant');
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
	tap.end();
});

tap.test('query posts', tap => {
	let posts = Post.query();
	tap.ok(posts.length > 0);
	tap.equal(typeof posts[0].url, 'string');
	tap.end();
});

tap.test('delete post', tap => {
	let post = Post.load(postId);
	post.remove();
	try {
		Post.load(postId);
	} catch (err) {
		tap.ok(err instanceof Queries.NotFoundError);
	}
	tap.end();
});

tap.test('invalid post type', async tap => {
	try {
		let user = User.load(userId);
		let post = Post.create(user, 'invalid');
	} catch (err) {
		tap.ok(err instanceof Post.UnknownPostType);
	}
	try {
		let post = Post.init({
			type: 'invalid'
		});
	} catch (err) {
		tap.ok(err instanceof Post.UnknownPostType);
	}
});
