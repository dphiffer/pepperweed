'use strict';

const User = require('../models/user');
const Post = require('../models/post');

module.exports = (fastify, opts, done) => {

	fastify.get('/new', async (req, reply) => {
		let user = await User.current(req);
		let post = await Post.create(user);
		return reply.redirect(post.editUrl);
	});

	fastify.get('/edit/:id', async (req, reply) => {
		let user = await User.current(req);
		let post = await Post.load(parseInt(req.params.id));
		return reply.view('edit.ejs', {
			user: user,
			post: post
		});
	});

	fastify.post('/edit/:id', async (req, reply) => {
		let post = await Post.load(parseInt(req.params.id));
		post.data.title = req.body.title;
		await post.save();
		return reply.redirect(post.url);
	});

	fastify.get('/@:user/:post', async (req, reply) => {
		let user = await User.load(req.params.user);
		let post = await Post.load(req.params.post);
		return reply.view('post.ejs', {
			user: user,
			post: post
		});
	});

	done();

};
