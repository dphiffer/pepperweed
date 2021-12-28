'use strict';

const tap = require('tap');
const Queries = require('../../src/db/queries');

tap.test('load user by invalid key', async tap => {
	let db = require('../../src/db');
	try {
		let user = await db.user.load('non-existant', 'value');
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
});
