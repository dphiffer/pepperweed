'use strict';

import tap from 'tap';
import db from '../../src/db/index.js';
import Queries from '../../src/db/queries.js';

tap.test('load post by invalid key', async tap => {
	try {
		let user = await db.post.load(1);
	} catch(err) {
		tap.equal(err instanceof Queries.InvalidInputError, true);
	}
});
