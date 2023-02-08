'use strict';

const tap = require('tap');
const fs = require('fs');
const build = require('../../src/app');

const User = require('../../src/models/user');

var url = null;
var cookies = null;
var resetId = null;

tap.test('user is not logged in', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/'
	});
	tap.match(rsp, {payload: /<a[^>]+href="\/login"/});
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
	tap.equal(rsp.headers.location, '/');
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
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.cookies[0].name, 'session');
});

tap.test('login redirects', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/login?redirect=/foo',
	});
	tap.match(rsp.payload, /<input type="hidden" name="redirect" value="\/foo">/);

	rsp = await app.inject({
		method: 'GET',
		url: '/login?redirect=foo',
	});
	tap.match(rsp.payload, /<input type="hidden" name="redirect" value="\/">/);

	rsp = await app.inject({
		method: 'GET',
		url: '/login?redirect=/login',
	});
	tap.match(rsp.payload, /<input type="hidden" name="redirect" value="\/">/);

	rsp = await app.inject({
		method: 'POST',
		url: '/login',
		body: {
			email: 'test@test.test',
			password: 'alpine',
			redirect: '/foo'
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/foo');

	rsp = await app.inject({
		method: 'POST',
		url: '/login',
		body: {
			email: 'test@test.test',
			password: 'alpine',
			redirect: 'foo'
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/');

	rsp = await app.inject({
		method: 'POST',
		url: '/login',
		body: {
			email: 'test@test.test',
			password: 'alpine',
			redirect: '/login'
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/');
});

tap.test('password reset config', async () => {
	let app = await build();
	await app.site.setOption('smtpConfig', 'smtp://user:password@test.test');
	app.site.setupMailer();
	tap.equal(app.site.smtpConfig, 'smtp://user:password@test.test');

	app.site.setupMailer({
		streamTransport: true
	});
});

tap.test('password reset load page', async () => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/password'
	});
	tap.equal(rsp.statusCode, 200);
});

tap.test('password reset redirect for logged in users', async () => {
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
	tap.equal(rsp.cookies[0].name, 'session');

	rsp = await app.inject({
		method: 'GET',
		url: '/password',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/');

	rsp = await app.inject({
		method: 'GET',
		url: '/password/tktktk',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/');

	rsp = await app.inject({
		method: 'POST',
		url: '/password',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/');

	rsp = await app.inject({
		method: 'POST',
		url: '/password/tktktk',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/');
});

tap.test('password reset request', async () => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/password',
		body: {
			email: 'test@test.test'
		}
	});
	tap.equal(rsp.statusCode, 302);
	url = rsp.headers.location;

	rsp = await app.inject({
		method: 'GET',
		url: url
	});
	tap.equal(rsp.statusCode, 200);
	resetId = url.match(/password\/(.+)$/)[1];
});

tap.test('password reset email does not exist', async () => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/password',
		body: {
			email: 'tktktk@test.test'
		}
	});
	tap.equal(rsp.statusCode, 200);
});

tap.test('password reset bogus request', async () => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/password/tktk'
	});
	tap.equal(rsp.statusCode, 200);

	rsp = await app.inject({
		method: 'POST',
		url: '/password/tktk',
		body: {
			code: '123456'
		}
	});
	tap.equal(rsp.statusCode, 200);
});

tap.test('password reset enter code', async () => {
	let app = await build();
	let db = require('../../src/db');
	let reset = await db.user.loadPasswordReset(resetId);

	let rsp = await app.inject({
		method: 'POST',
		url: url,
		body: {
			code: reset.code
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/password/reset');
	tap.equal(rsp.cookies[0].name, 'session');
	cookies = rsp.cookies;
});

tap.test('password reset change password', async () => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/password/reset',
		cookies: {
			session: cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 200);

	rsp = await app.inject({
		method: 'POST',
		url: '/password/reset',
		body: {
			password: 'alpine2',
			password_again: 'alpine2',
		},
		cookies: {
			session: cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/');
});

tap.test('password reset not logged in', async () => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/password/reset'
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/password');

	rsp = await app.inject({
		method: 'POST',
		url: '/password/reset',
		body: {
			password: 'alpine2',
			password_again: 'alpine2',
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/password');
});

tap.test('password reset login with changed password', async () => {
	let app = await build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/login',
		body: {
			email: 'test@test.test',
			password: 'alpine2'
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.cookies[0].name, 'session');
});
