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
			title: 'Testing',
			fromEmail: 'test@test.test',
			smtpConfig: 'smtp://user:pass@smtp.example.com'
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

tap.test('save settings without a site title', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/settings',
		body: {
			title: '',
			fromEmail: 'test@test.test',
			smtpConfig: 'smtp://user:pass@smtp.example.com'
		},
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 400);
});

tap.test('save settings without a from email', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/settings',
		body: {
			title: 'Testing',
			fromEmail: '',
			smtpConfig: 'smtp://user:pass@smtp.example.com'
		},
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 400);
});

tap.test('save settings without an smtp config', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/settings',
		body: {
			title: 'Testing',
			fromEmail: 'test@test.test',
			smtpConfig: ''
		},
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 400);
});

tap.test('save settings enabling signup', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/settings',
		body: {
			title: 'Testing',
			fromEmail: 'test@test.test',
			smtpConfig: 'smtp://user:pass@smtp.example.com',
			signupEnabled: '1'
		},
		cookies: {
			'session': cookies[0].value
		}
	});
	let signupEnabled = await app.site.getOption('signupEnabled');
	tap.equal(signupEnabled, '1');
});
