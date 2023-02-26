'use strict';

const fs = require('fs');
const tap = require('tap');
const build = require('../../src/app');

process.env.DATABASE = './data/test-initialize.db';
if (fs.existsSync(process.env.DATABASE)) {
	fs.unlinkSync(process.env.DATABASE);
}

var cookies;

tap.test('uninitialized site redirects', async tap => {
	let app = build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/'
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/signup');

	rsp = await app.inject({
		method: 'GET',
		url: '/login'
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/signup');
});

tap.test('initalize first account', async tap => {
	let app = build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/signup',
		body: {
			email: 'initialize@test.test',
			slug: 'initialize',
			name: 'Initialize',
			password: 'alpine123'
		}
	});
	cookies = rsp.cookies;
	tap.equal(rsp.cookies[0].name, 'session');
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/settings');
	tap.equal(app.site.options.initialize, 1);

	rsp = await app.inject({
		method: 'GET',
		url: '/',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(rsp.headers.location, '/settings');
});

tap.test('initialize settings', async tap => {
	let app = build();
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
	tap.equal(rsp.headers.location, '/edit');
	tap.equal(app.site.options.initialize, 2);
});

tap.test('initialize first post', async tap => {
	let app = build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/new',
		body: {
			title: 'Testing',
			content: 'hi'
		},
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.equal(rsp.statusCode, 302);
	tap.equal(app.site.options.initialize, 3);
});
