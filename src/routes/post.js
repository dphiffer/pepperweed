'use strict';

const User = require('../models/user');
const Post = require('../models/post');
const TextPost = require('../models/post/text');
const error = require('./error');

module.exports = (fastify, opts, done) => {

	fastify.get('/:user/:post', async (req, reply) => {
		let user = await User.load(req.params.user);
		let post = await Post.load(req.params.post);
		if (post.user.id != user.id) {
			return error.http404(req, reply);
		}
		post.context = 'view';
		let current_user = await User.current(req);
		return reply.view('post.ejs', {
			user: current_user,
			post: post
		});
	});

	fastify.get('/edit', async (req, reply) => {
		let user = await User.current(req);
		if (! user) {
			return reply.redirect('/login?redirect=/edit');
		}
		return reply.view('edit.ejs', {
			user: user,
			post: {
				id: 'new',
				edit_url: '/new',
				attributes: TextPost.attributes()
			}
		});
	});

	fastify.post('/new', async (req, reply) => {
		let user = await User.current(req);
		if (! user) {
			return error.http401(req, reply, `Sorry, you need to login before
				you can create a new post.`);
		}
		let post = await Post.create(user, 'text');
		post.data.title = req.body.title;
		post.updateAttributes(req.body);
		await post.save();
		return reply.redirect(post.url);
	});

	fastify.get('/edit/:id', async (req, reply) => {
		var user, post, feedback;
		try {
			feedback = 'Sorry, you can’t edit that post.';
			user = await User.current(req);
			if (! user) {
				feedback += ` <a href="/login?redirect=${req.url}">Try logging in?</a>`;
			}
			let id = parseInt(req.params.id);
			post = await Post.load(id);
			if (! user || post.user.id != user.id) {
				return error.http404(req, reply, feedback);
			}
			post.context = 'edit';
		} catch (err) {
			return error.http404(req, reply, feedback);
		}
		return reply.view('edit.ejs', {
			user: user,
			post: post
		});
	});

	fastify.post('/edit/:id', async (req, reply) => {
		var post, user;
		try {
			let id = parseInt(req.params.id);
			post = await Post.load(id);
			user = await User.current(req);
			if (! user || post.user.id != user.id) {
				return error.http404(req, reply, `Sorry, you can’t edit that post.`);
			}
		} catch (err) {
			return error.http404(req, reply, `Sorry, you can’t edit that post.`);
		}
		post.data.title = req.body.title;
		post.updateAttributes(req.body);
		await post.save();
		return reply.redirect(post.url);
	});

	done();

};
