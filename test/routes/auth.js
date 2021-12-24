const tap = require('tap');
const fs = require('fs');
const build = require('../../src/app');

const db_path = './test-auth.db';
process.env.DB_PATH = db_path;
if (fs.existsSync(db_path)) {
	fs.unlinkSync(db_path);
}

const User = require('../../src/models/user');
var cookies = null;

tap.test('user is not logged in', async tap => {
	let app = build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/'
	});
	tap.match(rsp, {payload: /<a href="\/signup">Sign up<\/a>/});
});

tap.test('sign up page', async tap => {
	let app = build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/signup'
	});
	tap.match(rsp.statusCode, 200);
});

tap.test('user sign up', async tap => {
	let app = build();
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
	let app = build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.match(rsp, {payload: /<a href="\/test">Test<\/a>/});
});

tap.test('sign up page redirects if logged in', async tap => {
	let app = build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/signup',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.match(rsp.statusCode, 302);
});

tap.test('log in page redirects if logged in', async tap => {
	let app = build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/login',
		cookies: {
			'session': cookies[0].value
		}
	});
	tap.match(rsp.statusCode, 302);
});

tap.test('user log out', async tap => {
	let app = build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/logout',
		cookie: {
			'session': cookies[0].value
		}
	});
	cookies = rsp.cookies;
	tap.match(rsp.statusCode, 302);
	tap.match(cookies[0].value, '');
});

tap.test('log in page', async tap => {
	let app = build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/login'
	});
	tap.match(rsp.statusCode, 200);
});

tap.test('incorrect login', async tap => {
	let app = build();
	let rsp = await app.inject({
		method: 'POST',
		url: '/login',
		body: {
			email: 'test@test.test',
			password: 'wrong password'
		}
	});
	cookies = rsp.cookies;
	tap.match(rsp.statusCode, 200);
	tap.match(rsp.cookies[0].name, 'session');
	tap.match(rsp.cookies[0].value, '');
});

tap.test('user logs in', async tap => {
	let app = build();
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

tap.teardown(tap => {
	if (fs.existsSync(db_path)) {
		fs.unlinkSync(db_path);
	}
});
