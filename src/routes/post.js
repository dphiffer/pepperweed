'use strict';

import User from '../models/user.js';
import Post from '../models/post.js';
import TextPost from '../models/post/text.js';
import error from './error.js';

export default (fastify, opts, done) => {

	fastify.get('/new', async (req, reply) => {
		let user = await User.current(req);
		if (! user) {
			return error.http401(req, reply, `Sorry, you need to login before
				you can create a new post.`);
		}
		let post = await Post.create(user, 'text');
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
		post.context = 'edit';
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
		post.updateAttributes(req.body);
		await post.save();
		return reply.redirect(post.url);
	});

	fastify.get('/:user/:post', async (req, reply) => {
		let user = await User.load(req.params.user);
		let post = await Post.load(req.params.post);
		if (post.user.id != user.id) {
			return error.http404(req, reply);
		}
		post.context = 'view';
		return reply.view('post.ejs', {
			user: user,
			post: post
		});
	});

	done();

};
