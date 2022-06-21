'use strict';

const tap = require('tap');
const fs = require('fs');
const build = require('../../src/app');
const User = require('../../src/models/user');
const Post = require('../../src/models/post');

var cookies = null;
var url;

tap.test('try to create new post without logging in', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/new'
	});
	tap.equal(rsp.statusCode, 401);
});

tap.test('signup and create new post', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/signup',
		body: {
			email: 'poster@test.test',
			slug: 'poster',
			name: 'Test',
			password: 'alpine'
		}
	});
	cookies = rsp.cookies;

	rsp = await app.inject({
		method: 'GET',
		url: '/new',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.match(rsp.headers, {
		location: /^\/poster\/[a-z0-9]{40}\/edit$/
	});
	url = rsp.headers.location;
});

tap.test('edit post', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: url,
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.match(rsp, {
		payload: /action="\/poster\/[a-z0-9]{40}\/edit"/
	});

	rsp = await app.inject({
		method: 'POST',
		url: url,
		body: {
			title: 'Hello world'
		},
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.match(rsp.headers, {location: /^\/poster\/\w{40}$/});
	url = rsp.headers.location;
});

tap.test('view post', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: url
	});
	tap.match(rsp, {payload: /<h2>.+?Hello world.+?<\/h2>/});
});

tap.test('invalid post requests', async tap => {
	let app = await build();
	let slug = url.match(/\/(\w{40})$/)[1];

	// Try to edit a post with an invalid path (user/post mismatch)
	let imposter = await User.create({
		name: 'imposter',
		slug: 'imposter',
		email: 'imposter@email',
		password: 'imposter'
	});
	let rsp = await app.inject({
		method: 'GET',
		url: `/imposter/${slug}/edit`,
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 404);

	// Try to submit an edit for a post with an invalid path
	rsp = await app.inject({
		method: 'POST',
		url: `/imposter/${slug}/edit`,
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 404);

	// Try to edit a post without any credentials
	rsp = await app.inject({
		method: 'GET',
		url: `/poster/${slug}/edit`,
		// cookies: {
		// 	'session': cookies[0].value
		// }
	});
	tap.equal(rsp.statusCode, 401);

	// Try to submit an edit for a post without any credentials
	rsp = await app.inject({
		method: 'POST',
		url: `/poster/${slug}/edit`,
		// cookies: {
		// 	'session': cookies[0].value
		// }
	});
	tap.equal(rsp.statusCode, 401);

	// Try to edit someone else's post
	let post = await Post.create(imposter, 'text');
	rsp = await app.inject({
		method: 'GET',
		url: `/imposter/${post.slug}/edit`,
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 403);

	// Try to submit an edit for someone else's post
	rsp = await app.inject({
		method: 'POST',
		url: `/imposter/${post.slug}/edit`,
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 403);

	// Try to request an invalid post
	rsp = await app.inject({
		method: 'GET',
		url: `/imposter/${slug}`
	});
	tap.equal(rsp.statusCode, 404);
});
