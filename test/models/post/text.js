'use strict';

const tap = require('tap');
const TextPost = require('../../../src/models/post/text');
const Post = require('../../../src/models/post');
const User = require('../../../src/models/user');

tap.test('text post parse content', async tap => {
	let user = await User.create({
		name: 'Post Maker',
		slug: 'textpost',
		email: 'tpmaker@test.test',
		password: 'alpine'
	});

	let post = await Post.create(user, 'text');
	post.update({
		content: '[test](/test)'
	});
	// console.log(post);
	tap.match(post.content, /<a href="\/test">test<\/a>/);
});
