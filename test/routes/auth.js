'use strict';

import tap from 'tap';
import fs from 'fs';
import build from '../../src/app.js';
import User from '../../src/models/user.js';

var cookies = null;

tap.test('user is not logged in', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/'
	});
	tap.match(rsp, {payload: /<a[^>]+href="\/signup"/});
});

tap.test('signup page', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/signup'
	});
	tap.equal(rsp.statusCode, 200);
});

tap.test('invalid signup', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/signup',
		body: {
			email: '',
			slug: '',
			name: '',
			password: ''
		}
	});
	tap.equal(rsp.statusCode, 400);
});

tap.test('valid signup', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/signup',
		body: {
			email: 'test@test.test',
			slug: 'test',
			name: 'Test',
			password: 'alpine'
		}
	});
	cookies = rsp.cookies;
	tap.equal(rsp.cookies[0].name, 'session');
	tap.equal(rsp.statusCode, 302);
});

tap.test('user is logged in', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.match(rsp, {payload: /<a href="\/logout">Logout<\/a>/});
});

tap.test('signup page redirects if logged in', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/signup',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
});

tap.test('login page redirects if logged in', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/login',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
});

tap.test('user logout', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/logout',
		cookie: {
			'session': cookies[0].value
		}
	});
	cookies = rsp.cookies;
	tap.equal(rsp.statusCode, 302);
	tap.equal(cookies[0].value, '');
});

tap.test('login page', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/login'
	});
	tap.equal(rsp.statusCode, 200);
});

tap.test('incorrect login', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/login',
		body: {
			email: 'test@test.test',
			password: 'wrong password'
		}
	});
	cookies = rsp.cookies;
	tap.equal(rsp.statusCode, 400);
	tap.equal(rsp.cookies.length, 0);
});

tap.test('user login', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/login',
		body: {
			email: 'test@test.test',
			password: 'alpine'
		}
	});
	cookies = rsp.cookies;
	tap.match(rsp.statusCode, 302);
	tap.match(rsp.cookies[0].name, 'session');
});
