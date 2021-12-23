let tap = require('tap');
let fs = require('fs');

let db_path = './test.db';
process.env.DB_PATH = db_path;
if (fs.existsSync(db_path)) {
	fs.unlinkSync(db_path);
}

let Queries = require('../../src/db/queries');
let User = require('../../src/models/user');

tap.test('create user', async tap => {
	let hash = await User.hashPassword('Hello world');
	let user = new User({
		slug: 'test',
		email: 'test@test.test',
		password: hash
	});
	await user.save();
	tap.equal(user.id, 1);
});

tap.test('load user by id', async tap => {
	let u1 = await User.load(1);
	tap.equal(u1.data.email, 'test@test.test');

	let u2 = await User.load('1');
	tap.equal(u1.data.slug, 'test');

	try {
		let u3 = await User.load(99);
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('load user by username', async tap => {
	let u1 = await User.load('test');
	tap.equal(u1.data.email, 'test@test.test');

	try {
		let u2 = await User.load('does-not-exist');
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}

	try {
		let u3 = await User.load('weird input');
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('load user by email', async tap => {
	let u1 = await User.load('test@test.test');
	tap.equal(u1.data.slug, 'test');

	try {
		let u2 = await User.load('does-not-exist@test.test');
	} catch (err) {
		tap.equal(err instanceof Queries.NotFoundError, true);
	}
});

tap.test('user login', async tap => {
	let user = await User.load('test@test.test');
	let r1 = await user.checkPassword('Hello world');
	tap.equal(r1, true);

	let r2 = await user.checkPassword('Wrong password');
	tap.equal(r2, false);
});

tap.test('update user', async tap => {
	let u1 = await User.load(1);
	u1.data.slug = 'test2';
	await u1.save();

	let u2 = await User.load(1);
	tap.equal(u2.data.slug, 'test2');
});

tap.test('query users', async tap => {
	let users = await User.query();
	tap.equal(users.length, 1);
	tap.equal(users[0].data.slug, 'test2');
});

tap.test('delete user', async tap => {
	let user = await User.load(1);
	await user.remove();

	let users = await User.query();
	tap.equal(users.length, 0);
});

tap.teardown(tap => {
	if (fs.existsSync(db_path)) {
		fs.unlinkSync(db_path);
	}
});
