'use strict';

const tap = require('tap');
const build = require('../../src/app');

tap.test('generate http 401', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/new'
	});
	tap.equal(rsp.statusCode, 401);
});

tap.test('generate http 404', async tap => {
	let app = await build();
	let rsp = await app.inject({
		method: 'GET',
		url: '/tktktk'
	});
	tap.equal(rsp.statusCode, 404);
});
