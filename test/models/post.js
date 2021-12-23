let tap = require('tap');
let fs = require('fs');

let db_path = './test-post.db';
process.env.DB_PATH = db_path;
if (fs.existsSync(db_path)) {
	fs.unlinkSync(db_path);
}

let Queries = require('../../src/db/queries');
let Post = require('../../src/models/post');

tap.test('create post', async tap => {
	let post = new Post({
		slug: 'hello-world',
		title: 'Hello world'
	});
	await post.save();
	tap.equal(post.id, 1);
});

tap.test('load post by id', async tap => {
	let p1 = await Post.load(1);
	tap.equal(p1.data.title, 'Hello world');

	try {
		let p2 = await Post.load(99);
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('update post', async tap => {
	let p1 = await Post.load(1);
	p1.data.slug = 'test';
	await p1.save();

	let p2 = await Post.load(1);
	tap.equal(p2.data.slug, 'test');
	tap.equal(p2.data.title, 'Hello world');
});

tap.test('query posts', async tap => {
	let posts = await Post.query();
	tap.equal(posts.length, 1);
	tap.equal(posts[0].data.title, 'Hello world');
});

tap.test('delete post', async tap => {
	let post = await Post.load(1);
	await post.remove();

	let posts = await Post.query();
	tap.equal(posts.length, 0);
});

tap.teardown(tap => {
	if (fs.existsSync(db_path)) {
		fs.unlinkSync(db_path);
	}
});
