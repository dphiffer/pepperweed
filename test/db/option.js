'use strict';

const tap = require('tap');
const db = require('../../src/db');

tap.test('load all options', tap => {
	db.option.create('load-all', 'load-all-value');
	let options = db.option.all();
	tap.equal(options['load-all'], 'load-all-value');
	tap.end();
});

tap.test('set and load an option', tap => {
	db.option.create('foo', 'foo');
	let option = db.option.load('foo');
	tap.equal(option, 'foo');
	tap.end();
});

tap.test('update an option', tap => {
	db.option.create('update-option', 'foo');
	db.option.update('update-option', 'bar');
	tap.equal(db.option.load('update-option'), 'bar');
	tap.end();
});

tap.test('delete an option', tap => {
	db.option.create('delete-option', 'foo');
	let info = db.option.remove('delete-option');
	tap.equal(info.changes, 1);
	tap.equal(db.option.load('delete-option'), null);
	tap.end();
});

tap.test('load an option that does not exist', tap => {
	let option = db.option.load('bar');
	tap.equal(option, null);

	let defaultValue = 'bar'
	option = db.option.load('bar', defaultValue);
	tap.equal(option, 'bar');
	tap.end();
});
