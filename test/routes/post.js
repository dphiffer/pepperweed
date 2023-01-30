'use strict';

const tap = require('tap');
const fs = require('fs');
const build = require('../../src/app');
const User = require('../../src/models/user');
const Post = require('../../src/models/post');

var cookies = null;
var url;

tap.test('create new post without logging in', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/edit'
	});
	tap.equal(rsp.headers.location, '/login?redirect=/edit');
	tap.equal(rsp.statusCode, 302);
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
		url: '/edit',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.match(rsp, {
		payload: new RegExp(`action="/new"`)
	});

	rsp = await app.inject({
		method: 'POST',
		url: '/new',
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
		url: url,
		cookies: {
			'session': cookies[0].value
		}
	});
	let editUrl = /<a href="([^"]+)">Edit post<\/a>/;
	tap.match(rsp, {payload: editUrl});
	tap.match(rsp, {payload: /<h2>.+?Hello world.+?<\/h2>/});
	url = rsp.payload.match(editUrl)[1];
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
		payload: new RegExp(`action="${url}"`)
	});

	rsp = await app.inject({
		method: 'POST',
		url: url,
		body: {
			title: 'Hola mundo'
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
	tap.match(rsp, {payload: /<h2>.+?Hola mundo.+?<\/h2>/});
});

tap.test('invalid post requests', async tap => {
	let app = await build();
	let slug = url.match(/\/(\w{40})$/)[1];

	// Try to edit someone else's post
	let rsp = await app.inject({
		method: 'POST',
		url: '/signup',
		body: {
			email: 'imposter@test.test',
			slug: 'imposter',
			name: 'Imposter',
			password: 'alpine'
		}
	});
	cookies = rsp.cookies;

	rsp = await app.inject({
		method: 'GET',
		url: '/edit/1',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 404);

	// Try to submit an edit for a post with an invalid path
	rsp = await app.inject({
		method: 'POST',
		url: '/edit/a',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 404);

	// Try to edit a post without any credentials
	rsp = await app.inject({
		method: 'GET',
		url: '/edit/1',
		// cookies: {
		// 	'session': cookies[0].value
		// }
	});
	tap.equal(rsp.statusCode, 404);

	// Try to submit an edit for a post without any credentials
	rsp = await app.inject({
		method: 'POST',
		url: '/edit/1',
		// cookies: {
		// 	'session': cookies[0].value
		// }
	});
	tap.equal(rsp.statusCode, 404);

	// Try to submit an edit for someone else's post
	rsp = await app.inject({
		method: 'POST',
		url: '/edit/1',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 404);

	// Try to edit a post that does not exist
	rsp = await app.inject({
		method: 'GET',
		url: '/edit/999',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 404);

	// Try to request an invalid post (user/post slug mismatch)
	rsp = await app.inject({
		method: 'GET',
		url: `/imposter/${slug}`
	});
	tap.equal(rsp.statusCode, 404);
});
