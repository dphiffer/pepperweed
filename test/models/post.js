let tap = require('tap');
let fs = require('fs');

let db_path = './test.db';
process.env.DB_PATH = db_path;
if (fs.existsSync(db_path)) {
	fs.unlinkSync(db_path);
}

let Post = require('../src/models/post');

tap.test('create post', async tap => {
	let post = new Post({
		slug: 'hello-world',
		title: 'Hello world'
	});
	await post.save();
	tap.equal(post.id, 1);
});

tap.test('load post by id', async tap => {
	let p1 = new Post(1);
	await p1.load();
	tap.equal(p1.data.title, 'Hello world');

	let p2 = new Post(99);
	await p2.load();
	tap.equal(p2, null);
});

tap.test('update post', async tap => {
	let p1 = new Post(1);
	p1.data.slug = 'test';
	await p1.save();

	let p2 = new Post(1);
	await p2.load();
	tap.equal(p2.data.slug, 'test');
});

tap.test('query posts', async tap => {
	let posts = await Post.query();
	tap.equal(posts.length, 1);
	tap.equal(posts[0].data.title, 'Hello world');
});

tap.test('delete post', async tap => {
	let post = new Post(1);
	await post.remove();

	let posts = await Post.query();
	tap.equal(posts.length, 0);
});

tap.teardown(tap => {
	fs.unlinkSync(db_path);
});
