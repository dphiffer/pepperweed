'use strict';

import tap from 'tap';
import fs from 'fs';
import build from '../../src/app.js';

var app;
tap.before(async () => {
	app = await build();
});

tap.test('site sessionKey', async tap => {
	let sessionKey = await app.site.getOption('sessionKey');
	tap.equal(sessionKey.length, 64);
});

tap.test('site missing option', async tap => {
	let doesNotExist = await app.site.getOption('test');
	tap.equal(doesNotExist, null);
});

tap.test('site create option', async tap => {
	await app.site.setOption('test', 'test');
	let option = await app.site.getOption('test');
	tap.equal(option, 'test');
});

tap.test('site update option', async tap => {
	await app.site.setOption('test', 'updated');
	let option = await app.site.getOption('test');
	tap.equal(option, 'updated');
});

tap.test('site remove option', async tap => {
	await app.site.removeOption('test');
	let option = await app.site.getOption('test');
	tap.equal(option, null);
});

tap.test('site remove nonexistant option', async tap => {
	await app.site.removeOption('test2');
	let option = await app.site.getOption('test2');
	tap.equal(option, null);
});
