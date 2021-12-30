'use strict';

const tap = require('tap');
const fs = require('fs');
const build = require('../../src/app');

var cookies = null;
var url;

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
	tap.match(rsp.headers, {location: /^\/edit\/\d+$/});
	url = rsp.headers.location;
});

tap.test('edit post', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: url
	});
	tap.match(rsp, {payload: /action="\/edit\/\d+"/});

	rsp = await app.inject({
		method: 'POST',
		url: url,
		body: {
			title: 'Hello world'
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
	tap.match(rsp, {payload: /<h2>Hello world<\/h2>/});
});
