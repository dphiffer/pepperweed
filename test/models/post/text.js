'use strict';

const tap = require('tap');
const TextPost = require('../../../src/models/post/text');
const Post = require('../../../src/models/post');
const User = require('../../../src/models/user');

tap.test('text post parse content', async tap => {
	let user = await User.create({
		name: 'Text Post Maker',
		slug: 'text-post-maker',
		email: 'text-post-maker@test.test',
		password: 'alpine123'
	});
	let post = Post.create(user, 'text');
	post.update({
		content: '[test](/test)'
	});
	tap.match(post.content, /<a href="\/test">test<\/a>/);
});
