'use strict';

const tap = require('tap');
const fs = require('fs');
const build = require('../../src/app');

var cookies = null;

tap.test('signup and create new post', async () => {
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
	tap.match(rsp.headers, {location: /^\/edit\/\w{40}$/});
});
