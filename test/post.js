let tap = require('tap');
let fs = require('fs');

(async () => {
	try {
		let db_path = './test.db';
		process.env.DB_PATH = db_path;
		if (fs.existsSync(db_path)) {
			fs.unlinkSync(db_path);
		}

		let db = require('../src/db');
		let Post = await require('../src/models/post')();

		let p1 = new Post({
			slug: 'hello-world',
			title: 'Hello world'
		});
		await p1.save();
		tap.equal(p1.id, 1);

		p1.data.slug = 'test';
		await p1.save();

		let id = p1.id;

		let p2 = new Post(id);
		await p2.load();
		tap.equal(p2.data.slug, 'test');

		let q = await db.post.query();
		tap.equal(q.length, 1);

		await db.post.remove(q[0]);

		let p3 = await db.post.load(id);
		tap.equal(p3, null);

		//if (fs.existsSync(db_path)) {
			// fs.unlinkSync(db_path);
		//}

		tap.pass('post.js');
	} catch(err) {
		console.error(err);
		tap.fail('post.js');
	}
})();
