'use strict';

const User = require('../models/user');
const Post = require('../models/post');
const error = require('./error');

module.exports = (fastify, opts, done) => {

	fastify.get('/new', async (req, reply) => {
		let user = await User.current(req);
		if (! user) {
			return error.http401(req, reply, `Sorry, you need to login before
				you can create a new post.`);
		}
		let post = await Post.create(user);
		return reply.redirect(post.edit_url);
	});

	fastify.get('/:user/:post/edit', async (req, reply) => {
		let user = await User.load(req.params.user);
		let post = await Post.load(req.params.post);
		if (post.user.id != user.id) {
			return error.http404(req, reply);
		}
		let current_user = await User.current(req);
		if (! current_user) {
			return error.http401(req, reply, `Sorry, you need to login before
				you can edit that post.`);
		}
		if (post.user.id != current_user.id) {
			return error.http403(req, reply, `Sorry, you are not allowed to
				edit that post.`);
		}
		return reply.view('edit.ejs', {
			user: user,
			post: post
		});
	});

	fastify.post('/:user/:post/edit', async (req, reply) => {
		let user = await User.load(req.params.user);
		let post = await Post.load(req.params.post);
		if (post.user.id != user.id) {
			return error.http404(req, reply);
		}
		let current_user = await User.current(req);
		if (! current_user) {
			return error.http401(req, reply, `Sorry, you need to login before
				you can edit that post.`);
		}
		if (post.user.id != current_user.id) {
			return error.http403(req, reply, `Sorry, you are not allowed to
				edit that post.`);
		}
		post.data.title = req.body.title;
		await post.save();
		return reply.redirect(post.url);
	});

	fastify.get('/:user/:post', async (req, reply) => {
		let user = await User.load(req.params.user);
		let post = await Post.load(req.params.post);
		if (post.user.id != user.id) {
			return error.http404(req, reply);
		}
		return reply.view('post.ejs', {
			user: user,
			post: post
		});
	});

	done();

};
