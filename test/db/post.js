'use strict';

const tap = require('tap');
const Queries = require('../../src/db/queries');

tap.test('load post by invalid key', async tap => {
	let db = require('../../src/db');
	try {
		let user = await db.post.load(1);
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
});
