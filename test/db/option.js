'use strict';

const tap = require('tap');
const db = require('../../src/db');

tap.test('set and load an option', async tap => {
	await db.option.create('foo', 'foo');
	let option = await db.option.load('foo');
	tap.equal(option, 'foo');
});

tap.test('load an option that does not exist', async tap => {
	let option = await db.option.load('bar');
	tap.equal(option, null);

	let defaultValue = 'bar'
	option = await db.option.load('bar', defaultValue);
	tap.equal(option, 'bar');
});
