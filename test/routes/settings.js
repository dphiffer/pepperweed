'use strict';

const tap = require('tap');
const build = require('../../src/app');

var cookies = null;
var url = null;

tap.test('user is not logged in', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/settings'
	});
	tap.match(rsp.statusCode, 302);
	tap.match(rsp.headers.location, '/login?redirect=/settings');

	rsp = await app.inject({
		method: 'POST',
		url: '/settings'
	});
	tap.match(rsp.statusCode, 401);
});

tap.test('load settings page', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/signup',
		body: {
			email: 'settings@test.test',
			slug: 'settings',
			name: 'Settings',
			password: 'alpine'
		}
	});
	tap.equal(rsp.cookies[0].name, 'session');
	tap.equal(rsp.statusCode, 302);
	cookies = rsp.cookies;

	rsp = await app.inject({
		method: 'GET',
		url: '/settings',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 200);
});

tap.test('save settings', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/settings',
		body: {
			title: 'Testing'
		},
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/');

	rsp = await app.inject({
		method: 'GET',
		url: '/'
	});
	tap.equal(rsp.statusCode, 200);
	tap.match(rsp, {
		payload: /<h1 class="header__title"><a href="\/">Testing<\/a><\/h1>/
	});
});

tap.test('save invalid settings', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/settings',
		body: {
			title: ''
		},
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 200);
	tap.match(rsp, {
		payload: /<div class="feedback">\s*Please enter a site title.\s*<\/div>/
	});
});
