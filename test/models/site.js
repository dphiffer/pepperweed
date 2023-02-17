'use strict';

const tap = require('tap');
const fs = require('fs');
const build = require('../../src/app');

tap.test('site sessionKey', tap => {
	let app = build();
	tap.equal(app.site.getOption('sessionKey').length, 64);
	tap.end();
});

tap.test('site missing option', tap => {
	let app = build();
	tap.equal(app.site.getOption('tk-does-not-exist'), null);
	tap.end();
});

tap.test('site create option', tap => {
	let app = build();
	app.site.setOption('test', 'test');
	tap.equal(app.site.getOption('test'), 'test');
	tap.end();
});

tap.test('site update option', tap => {
	let app = build();
	app.site.setOption('test', 'updated');
	tap.equal(app.site.getOption('test'), 'updated');
	tap.end();
});

tap.test('site remove option', tap => {
	let app = build();
	app.site.removeOption('test');
	tap.equal(app.site.getOption('test'), null);
	tap.end();
});

tap.test('site remove non-existant option', tap => {
	let app = build();
	app.site.removeOption('test2');
	tap.equal(app.site.getOption('test2'), null);
	tap.end();
});
